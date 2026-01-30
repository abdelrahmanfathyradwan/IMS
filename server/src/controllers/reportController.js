const Customer = require('../models/Customer');
const Contract = require('../models/Contract');
const Installment = require('../models/Installment');
const Notification = require('../models/Notification');

// @desc    Get dashboard summary
// @route   GET /api/reports/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
    try {
        // Update overdue installments first
        await Installment.updateMany(
            { status: 'unpaid', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const [
            totalCustomers,
            totalContracts,
            activeContracts,
            totalInstallments,
            paidInstallments,
            overdueInstallments,
            upcomingInstallments
        ] = await Promise.all([
            Customer.countDocuments(),
            Contract.countDocuments(),
            Contract.countDocuments({ status: 'active' }),
            Installment.countDocuments(),
            Installment.countDocuments({ status: 'paid' }),
            Installment.countDocuments({ status: 'overdue' }),
            Installment.countDocuments({
                status: 'unpaid',
                dueDate: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);

        // Get financial summary
        const contracts = await Contract.find();
        const totalContractValue = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
        const totalDownPayments = contracts.reduce((sum, c) => sum + c.downPayment, 0);

        const installments = await Installment.find();
        const totalCollected = installments
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0);
        const totalPending = installments
            .filter(i => i.status !== 'paid')
            .reduce((sum, i) => sum + i.amount, 0);

        // Recent activity
        const recentPayments = await Installment.find({ status: 'paid' })
            .populate({
                path: 'contractId',
                populate: { path: 'customerId', select: 'name' }
            })
            .sort({ paidDate: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                customers: {
                    total: totalCustomers
                },
                contracts: {
                    total: totalContracts,
                    active: activeContracts,
                    completed: totalContracts - activeContracts
                },
                installments: {
                    total: totalInstallments,
                    paid: paidInstallments,
                    overdue: overdueInstallments,
                    upcoming: upcomingInstallments,
                    unpaid: totalInstallments - paidInstallments - overdueInstallments
                },
                financial: {
                    totalContractValue,
                    totalDownPayments,
                    totalCollected: totalCollected + totalDownPayments,
                    totalPending,
                    collectionRate: totalInstallments > 0
                        ? Math.round((paidInstallments / totalInstallments) * 100)
                        : 0
                },
                recentPayments
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get installments report
// @route   GET /api/reports/installments
// @access  Private
exports.getInstallmentsReport = async (req, res, next) => {
    try {
        const { startDate, endDate, status, customerId } = req.query;

        let query = {};

        if (startDate || endDate) {
            query.dueDate = {};
            if (startDate) query.dueDate.$gte = new Date(startDate);
            if (endDate) query.dueDate.$lte = new Date(endDate);
        }

        if (status) query.status = status;

        let installments = await Installment.find(query)
            .populate({
                path: 'contractId',
                populate: { path: 'customerId', select: 'name phone email' }
            })
            .sort({ dueDate: 1 });

        if (customerId) {
            installments = installments.filter(
                i => i.contractId?.customerId?._id?.toString() === customerId
            );
        }

        // Group by status
        const summary = {
            paid: installments.filter(i => i.status === 'paid'),
            unpaid: installments.filter(i => i.status === 'unpaid'),
            overdue: installments.filter(i => i.status === 'overdue'),
            partial: installments.filter(i => i.status === 'partial')
        };

        const totals = {
            totalAmount: installments.reduce((sum, i) => sum + i.amount, 0),
            paidAmount: installments.reduce((sum, i) => sum + (i.paidAmount || 0), 0),
            count: installments.length,
            paidCount: summary.paid.length,
            unpaidCount: summary.unpaid.length,
            overdueCount: summary.overdue.length
        };

        res.status(200).json({
            success: true,
            data: {
                installments,
                summary,
                totals
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customers report
// @route   GET /api/reports/customers
// @access  Private
exports.getCustomersReport = async (req, res, next) => {
    try {
        const customers = await Customer.find().populate('contracts');

        const report = await Promise.all(customers.map(async (customer) => {
            const contracts = await Contract.find({ customerId: customer._id });
            const contractIds = contracts.map(c => c._id);

            const installments = await Installment.find({ contractId: { $in: contractIds } });

            return {
                customer: {
                    id: customer._id,
                    name: customer.name,
                    phone: customer.phone,
                    email: customer.email
                },
                contracts: contracts.length,
                totalValue: contracts.reduce((sum, c) => sum + c.totalAmount, 0),
                installments: {
                    total: installments.length,
                    paid: installments.filter(i => i.status === 'paid').length,
                    overdue: installments.filter(i => i.status === 'overdue').length
                },
                totalPaid: installments
                    .filter(i => i.status === 'paid')
                    .reduce((sum, i) => sum + (i.paidAmount || i.amount), 0),
                totalPending: installments
                    .filter(i => i.status !== 'paid')
                    .reduce((sum, i) => sum + i.amount, 0)
            };
        }));

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get overdue report
// @route   GET /api/reports/overdue
// @access  Private
exports.getOverdueReport = async (req, res, next) => {
    try {
        // Update overdue status
        await Installment.updateMany(
            { status: 'unpaid', dueDate: { $lt: new Date() } },
            { status: 'overdue' }
        );

        const overdueInstallments = await Installment.find({ status: 'overdue' })
            .populate({
                path: 'contractId',
                populate: { path: 'customerId' }
            })
            .sort({ dueDate: 1 });

        // Group by customer
        const groupedByCustomer = {};

        overdueInstallments.forEach(installment => {
            const customerId = installment.contractId?.customerId?._id?.toString();
            if (!customerId) return;

            if (!groupedByCustomer[customerId]) {
                groupedByCustomer[customerId] = {
                    customer: installment.contractId.customerId,
                    installments: [],
                    totalOverdue: 0,
                    count: 0
                };
            }

            groupedByCustomer[customerId].installments.push(installment);
            groupedByCustomer[customerId].totalOverdue += installment.amount;
            groupedByCustomer[customerId].count++;
        });

        const report = Object.values(groupedByCustomer);

        res.status(200).json({
            success: true,
            data: {
                totalOverdueAmount: overdueInstallments.reduce((sum, i) => sum + i.amount, 0),
                totalOverdueCount: overdueInstallments.length,
                customersWithOverdue: report.length,
                byCustomer: report
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get monthly collection report
// @route   GET /api/reports/monthly
// @access  Private
exports.getMonthlyReport = async (req, res, next) => {
    try {
        const { year = new Date().getFullYear() } = req.query;

        const monthlyData = await Installment.aggregate([
            {
                $match: {
                    status: 'paid',
                    paidDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$paidDate' },
                    totalCollected: { $sum: '$paidAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing months
        const months = Array.from({ length: 12 }, (_, i) => {
            const found = monthlyData.find(m => m._id === i + 1);
            return {
                month: i + 1,
                monthName: new Date(year, i, 1).toLocaleString('default', { month: 'long' }),
                totalCollected: found ? found.totalCollected : 0,
                count: found ? found.count : 0
            };
        });

        res.status(200).json({
            success: true,
            data: {
                year: parseInt(year),
                months,
                totalYearlyCollection: months.reduce((sum, m) => sum + m.totalCollected, 0)
            }
        });
    } catch (error) {
        next(error);
    }
};
