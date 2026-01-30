const Settings = require('../models/Settings');

// Default settings
const defaultSettings = {
    companyName: 'Installment Management System',
    currency: 'USD',
    currencySymbol: '$',
    dateFormat: 'YYYY-MM-DD',
    reminderDaysBefore: 7,
    overdueGraceDays: 0,
    enableEmailNotifications: true,
    enableWhatsAppNotifications: true,
    installmentFrequency: 'monthly',
    defaultPaymentMethod: 'cash'
};

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
    try {
        const settings = await Settings.find();

        // Merge with defaults
        const settingsObj = { ...defaultSettings };
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        res.status(200).json({
            success: true,
            data: settingsObj
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
    try {
        const updates = req.body;

        const updatedSettings = await Promise.all(
            Object.entries(updates).map(([key, value]) =>
                Settings.findOneAndUpdate(
                    { key },
                    { value, updatedAt: new Date() },
                    { upsert: true, new: true }
                )
            )
        );

        // Return merged settings
        const allSettings = await Settings.find();
        const settingsObj = { ...defaultSettings };
        allSettings.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        res.status(200).json({
            success: true,
            data: settingsObj
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single setting
// @route   GET /api/settings/:key
// @access  Private
exports.getSetting = async (req, res, next) => {
    try {
        const value = await Settings.getSetting(
            req.params.key,
            defaultSettings[req.params.key]
        );

        res.status(200).json({
            success: true,
            data: { key: req.params.key, value }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res, next) => {
    try {
        await Settings.deleteMany({});

        // Insert defaults
        await Promise.all(
            Object.entries(defaultSettings).map(([key, value]) =>
                Settings.create({ key, value })
            )
        );

        res.status(200).json({
            success: true,
            data: defaultSettings
        });
    } catch (error) {
        next(error);
    }
};
