// nourabelle-backend/routes/contact.js - DEBUG VERSION
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

console.log('Contact route loading...');

// Gmail transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nourabellebynour@gmail.com',
        pass: 'zawx qrrk ggnv wurz'
    },
    tls: {
        rejectUnauthorized: false // Fix for certificate issues
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
});

// Test the connection when server starts
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// POST route to send contact form emails
router.post('/send', async (req, res) => {
    console.log('📧 Contact form submission received');
    console.log('Request body:', req.body);
    
    const { name, email, message } = req.body;

    // Validation
    if (!email || !message) {
        console.log('❌ Validation failed - missing email or message');
        return res.status(400).json({ error: 'Email and message are required.' });
    }

    console.log('✅ Validation passed');

    // Email options
    const mailOptions = {
        from: `"${name || 'Contact Form'}" <nourabellebynour@gmail.com>`, // Use your email as sender
        replyTo: email, // User's email as reply-to
        to: 'nourabellebynour@gmail.com',
        subject: `New Contact Form Message from ${name || 'Customer'}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ad7c7c;">New Contact Form Message</h2>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> ${name || 'Not provided'}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div style="background: white; padding: 20px; border-left: 4px solid #ad7c7c;">
                    <h3>Message:</h3>
                    <p style="line-height: 1.6;">${message}</p>
                </div>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">
                    This message was sent from the Nourabelle contact form.
                </p>
            </div>
        `,
        text: `Name: ${name || 'N/A'}\nEmail: ${email}\nDate: ${new Date().toLocaleString()}\n\nMessage:\n${message}`
    };

    console.log('📧 Attempting to send email...');
    console.log('Mail options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
    });

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        res.status(200).json({ message: 'Message sent successfully! We\'ll get back to you soon.' });
    } catch (error) {
        console.log('❌ Email sending failed:');
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Full error:', error);
        
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

console.log('Contact route loaded successfully');
module.exports = router;