const Contract = require('../models/Contract');
const Installment = require('../models/Installment');
const { generateInstallments } = require('../services/installmentService');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res, next) => {
    try {
        const { status, customerId, page = 1, limit = 10 } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (customerId) {
            query.customerId = customerId;
        }

        const total = await Contract.countDocuments(query);
        const contracts = await Contract.find(query)
            .populate('customerId', 'name phone email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: contracts.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            data: contracts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single contract with installments
// @route   GET /api/contracts/:id
// @access  Private
exports.getContract = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id)
            .populate('customerId')
            .populate('installments');

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contract
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create contract (auto-generates installments)
// @route   POST /api/contracts
// @access  Private
exports.createContract = async (req, res, next) => {
    try {
        const contract = await Contract.create(req.body);

        // Generate installments
        await generateInstallments(contract);

        // Fetch contract with installments
        const populatedContract = await Contract.findById(contract._id)
            .populate('customerId')
            .populate('installments');

        res.status(201).json({
            success: true,
            data: populatedContract
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
exports.updateContract = async (req, res, next) => {
    try {
        // Prevent updating certain fields that affect installments
        const { totalAmount, downPayment, numberOfInstallments, startDate, ...updateData } = req.body;

        const contract = await Contract.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('customerId');

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        res.status(200).json({
            success: true,
            data: contract
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete contract and its installments
// @route   DELETE /api/contracts/:id
// @access  Private/Admin
exports.deleteContract = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        // Delete all installments for this contract
        await Installment.deleteMany({ contractId: contract._id });

        await contract.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get contract summary (paid, unpaid, overdue counts)
// @route   GET /api/contracts/:id/summary
// @access  Private
exports.getContractSummary = async (req, res, next) => {
    try {
        const contract = await Contract.findById(req.params.id);

        if (!contract) {
            return res.status(404).json({
                success: false,
                message: 'Contract not found'
            });
        }

        const installments = await Installment.find({ contractId: contract._id });

        const summary = {
            totalInstallments: installments.length,
            paid: installments.filter(i => i.status === 'paid').length,
            unpaid: installments.filter(i => i.status === 'unpaid').length,
            overdue: installments.filter(i => i.status === 'overdue').length,
            totalPaid: installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0),
            totalRemaining: installments.reduce((sum, i) => i.status !== 'paid' ? sum + i.amount : sum, 0)
        };

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
};
