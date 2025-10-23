import emailjs from 'emailjs-com';

const sendEmailNotification = (invoiceNo, total, items) => {
  const itemList = items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.description || "No Name"} — Qty: ${item.qty} — ₹${item.amount}`
    )
    .join('\n');

  emailjs
    .send(
      'service_y3k7idi',       // Your Service ID
      'template_8etkt0s',      // Your Template ID
      {
        to_name: 'Saksham',              // {{to_name}}
        to_email: 'suckzhum@gmail.com',  // {{to_email}} required if template uses it
        invoiceNo,                        // {{invoiceNo}}
        total,                            // {{total}}
        items: itemList,                  // {{items}}
      },
      'public_8xBownwpDoTxJ-MgL'         // Your Public Key
    )
    .then(() => console.log('📧 Email sent successfully!'))
    .catch((err) => console.error('❌ EmailJS error:', err));
};

export default sendEmailNotification;
