// Test script for Resend email functionality
// Run with: node test-email.js

const testData = {
  customerDetails: {
    fullName: "Test Customer",
    email: "test@example.com",
    phone: "+1234567890",
    companyName: "Test Company",
    notes: "This is a test email"
  },
  shapes: [
    {
      type: "rectangle",
      width: 100,
      height: 50,
      quantity: 2
    }
  ],
  material: {
    name: "Stainless Steel",
    thickness: 3,
    unit: "mm",
    pricePerSquareMeter: 25.00
  },
  svgContent: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
  <rect width="100" height="50" fill="none" stroke="black" stroke-width="1"/>
  <text x="50" y="25" text-anchor="middle" fill="black" font-size="10">TEST</text>
</svg>`
};

console.log('Sending test email to API endpoint...');
console.log('Make sure your dev server is running on http://localhost:3000\n');

fetch('http://localhost:3000/api/submit-job', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
  .then(async response => {
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS! Email sent. Check your inbox at:', process.env.ENGINEER_EMAIL || 'engineer email');
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Request failed:', error.message);
    console.log('\nMake sure your dev server is running: npm run dev');
  });
