let Joi = null;
let sellerSchema = null;

/**
 * Dynamically import Joi to prevent startup crash if package is missing
 */
const initJoi = async () => {
  try {
    const joiModule = await import('joi');
    Joi = joiModule.default || joiModule;
    
    if (Joi) {
      sellerSchema = Joi.object({
        fullName: Joi.string().required().messages({
          'any.required': 'Full Name is required',
          'string.empty': 'Full Name cannot be empty'
        }),
        email: Joi.string().email().required().messages({
          'any.required': 'Email Address is required',
          'string.email': 'Please enter a valid email address'
        }),
        phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
          'any.required': 'Phone Number is required',
          'string.pattern.base': 'Phone Number must be a valid 10-digit number'
        }),
        password: Joi.string().min(8).required().messages({
          'any.required': 'Password is required',
          'string.min': 'Password must be at least 8 characters long'
        }),
        businessName: Joi.string().required().messages({
          'any.required': 'Business Name is required'
        }),
        gstNumber: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required().messages({
          'any.required': 'GST Number is required',
          'string.pattern.base': 'GST Number must be a valid 15-character GSTIN format (e.g. 22AAAAA1111A1Z1)'
        }),
        panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).required().messages({
          'any.required': 'PAN Number is required',
          'string.pattern.base': 'PAN Number must be a valid 10-character alphanumeric PAN format (e.g. ABCDE1234F)'
        }),
        businessAddress: Joi.string().required().messages({
          'any.required': 'Business Address is required'
        }),
        city: Joi.string().required().messages({
          'any.required': 'City is required'
        }),
        state: Joi.string().required().messages({
          'any.required': 'State is required'
        }),
        pincode: Joi.string().pattern(/^[1-9][0-9]{5}$/).required().messages({
          'any.required': 'Pincode is required',
          'string.pattern.base': 'Pincode must be a valid 6-digit number'
        }),
        accountHolderName: Joi.string().required().messages({
          'any.required': 'Account Holder Name is required'
        }),
        bankName: Joi.string().required().messages({
          'any.required': 'Bank Name is required'
        }),
        accountNumber: Joi.string().min(9).max(18).required().messages({
          'any.required': 'Account Number is required',
          'string.min': 'Account Number must be at least 9 digits',
          'string.max': 'Account Number cannot exceed 18 digits'
        }),
        ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required().messages({
          'any.required': 'IFSC Code is required',
          'string.pattern.base': 'IFSC Code must be valid (e.g. SBIN0001234)'
        }),
        upiId: Joi.string().pattern(/^[\w.-]+@[\w.-]+$/).optional().allow('').messages({
          'string.pattern.base': 'UPI ID must be a valid format (e.g. name@bank)'
        })
      });
    }
  } catch (err) {
    console.warn("Joi package is not installed. Falling back to Vanilla JS validation.");
  }
};

// Initialize Joi schema
initJoi();

/**
 * Validates seller application data
 */
export const validateSeller = (data) => {
  if (Joi && sellerSchema) {
    return sellerSchema.validate(data, { abortEarly: false });
  } else {
    // Pure Javascript validation fallback if Joi is not present in node_modules
    const errors = [];

    if (!data.fullName) errors.push({ message: 'Full Name is required' });
    
    if (!data.email) {
      errors.push({ message: 'Email Address is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({ message: 'Please enter a valid email address' });
    }

    if (!data.phone) {
      errors.push({ message: 'Phone Number is required' });
    } else if (!/^[0-9]{10}$/.test(data.phone)) {
      errors.push({ message: 'Phone Number must be a valid 10-digit number' });
    }

    if (!data.password) {
      errors.push({ message: 'Password is required' });
    } else if (data.password.length < 8) {
      errors.push({ message: 'Password must be at least 8 characters long' });
    }

    if (!data.businessName) errors.push({ message: 'Business Name is required' });

    if (!data.gstNumber) {
      errors.push({ message: 'GST Number is required' });
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber.toUpperCase())) {
      errors.push({ message: 'GST Number must be a valid 15-character GSTIN format (e.g. 22AAAAA1111A1Z1)' });
    }

    if (!data.panNumber) {
      errors.push({ message: 'PAN Number is required' });
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber.toUpperCase())) {
      errors.push({ message: 'PAN Number must be a valid 10-character alphanumeric PAN format (e.g. ABCDE1234F)' });
    }

    if (!data.businessAddress) errors.push({ message: 'Business Address is required' });
    if (!data.city) errors.push({ message: 'City is required' });
    if (!data.state) errors.push({ message: 'State is required' });

    if (!data.pincode) {
      errors.push({ message: 'Pincode is required' });
    } else if (!/^[1-9][0-9]{5}$/.test(data.pincode)) {
      errors.push({ message: 'Pincode must be a valid 6-digit number' });
    }

    if (!data.accountHolderName) errors.push({ message: 'Account Holder Name is required' });
    if (!data.bankName) errors.push({ message: 'Bank Name is required' });

    if (!data.accountNumber) {
      errors.push({ message: 'Account Number is required' });
    } else if (data.accountNumber.length < 9) {
      errors.push({ message: 'Account Number must be at least 9 digits' });
    } else if (data.accountNumber.length > 18) {
      errors.push({ message: 'Account Number cannot exceed 18 digits' });
    }

    if (!data.ifscCode) {
      errors.push({ message: 'IFSC Code is required' });
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode.toUpperCase())) {
      errors.push({ message: 'IFSC Code must be valid (e.g. SBIN0001234)' });
    }

    if (data.upiId && !/^[\w.-]+@[\w.-]+$/.test(data.upiId)) {
      errors.push({ message: 'UPI ID must be a valid format (e.g. name@bank)' });
    }

    if (errors.length > 0) {
      return {
        error: {
          details: errors.map(err => ({ message: err.message }))
        }
      };
    }

    return { error: null };
  }
};
