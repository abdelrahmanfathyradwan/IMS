const Installment = require('../models/Installment');
const Contract = require('../models/Contract');
const { sendPaymentNotification } = require('../services/notificationService');

// @desc    Get all installments
// @route   GET /api/installments
// @access  Private
exports.getInstallments = async (req, res, next) => {
    try {
        const { status, contractId, customerId, startDate, endDate, page = 1, limit = 10 } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (contractId) {
            query.contractId = contractId;
        }

        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        // Update overdue status before fetching
        await Installment.updateMany(
            {
                status: 'unpaid',
                dueDate: { $lt: new Date() }
            },
            { status: 'overdue' }
        );

        let installments = Installment.find(query)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId', select: 'name phone email' }
            })
            .sort({ dueDate: 1 });

        // Filter by customer if provided
        if (customerId) {
            installments = installments.then(results =>
                results.filter(i => i.contractId?.customerId?._id?.toString() === customerId)
            );
        }

        const total = await Installment.countDocuments(query);
        const results = await installments
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: results.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: results
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single installment
// @route   GET /api/installments/:id
// @access  Private
exports.getInstallment = async (req, res, next) => {
    try {
        const installment = await Installment.findById(req.params.id)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId' }
            });

        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: installment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update installment
// @route   PUT /api/installments/:id
// @access  Private
exports.updateInstallment = async (req, res, next) => {
    try {
        const { notes, paymentMethod, dueDate } = req.body;

        const installment = await Installment.findByIdAndUpdate(
            req.params.id,
            { notes, paymentMethod, dueDate },
            { new: true, runValidators: true }
        ).populate({
            path: 'contractId',
            populate: { path: 'customerId' }
        });

        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        res.status(200).json({
            success: true,
            data: installment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark installment as paid
// @route   POST /api/installments/:id/pay
// @access  Private
exports.payInstallment = async (req, res, next) => {
    try {
        const { amount, paymentMethod, notes } = req.body;

        const installment = await Installment.findById(req.params.id);

        if (!installment) {
            return res.status(404).json({
                success: false,
                message: 'Installment not found'
            });
        }

        if (installment.status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Installment is already paid'
            });
        }

        const paidAmount = amount || installment.amount;

        installment.paidAmount = paidAmount;
        installment.paidDate = new Date();
        installment.paymentMethod = paymentMethod || 'cash';
        installment.notes = notes || installment.notes;

        if (paidAmount >= installment.amount) {
            installment.status = 'paid';
        } else {
            installment.status = 'partial';
        }

        await installment.save();

        // Check if all installments are paid
        const contract = await Contract.findById(installment.contractId);
        const allInstallments = await Installment.find({ contractId: contract._id });
        const allPaid = allInstallments.every(i => i.status === 'paid');

        if (allPaid) {
            contract.status = 'completed';
            await contract.save();
        }

        // Send payment notification
        await sendPaymentNotification(installment);

        const populatedInstallment = await Installment.findById(installment._id)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId' }
            });

        res.status(200).json({
            success: true,
            data: populatedInstallment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get overdue installments
// @route   GET /api/installments/overdue
// @access  Private
exports.getOverdueInstallments = async (req, res, next) => {
    try {
        // Update overdue status
        await Installment.updateMany(
            {
                status: 'unpaid',
                dueDate: { $lt: new Date() }
            },
            { status: 'overdue' }
        );

        const installments = await Installment.getOverdue();

        res.status(200).json({
            success: true,
            count: installments.length,
            data: installments
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get upcoming installments (next 7 days)
// @route   GET /api/installments/upcoming
// @access  Private
exports.getUpcomingInstallments = async (req, res, next) => {
    try {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        const installments = await Installment.find({
            status: 'unpaid',
            dueDate: {
                $gte: today,
                $lte: nextWeek
            }
        }).populate({
            path: 'contractId',
            populate: { path: 'customerId', select: 'name phone email' }
        }).sort({ dueDate: 1 });

        res.status(200).json({
            success: true,
            count: installments.length,
            data: installments
        });
    } catch (error) {
        next(error);
    }
};
