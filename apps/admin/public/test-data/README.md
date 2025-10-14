# Test Data for Bulk Import Feature

This directory contains sample CSV files to test the bulk import functionality.

## Files Included

### 1. `members-sample.csv`
- **10 members** with realistic Kenyan names, phone numbers, and locations
- All set as "member" role (you can change some to "admin" if needed)
- Includes National IDs and addresses

### 2. `contributions-sample.csv`
- **35 contribution records** spanning October 2024 to January 2025
- All members have contributions for October, November, December 2024
- 5 members have January 2025 contributions
- Mix of payment methods: M-Pesa (with transaction refs), Cash, Bank Transfer
- All marked as "paid" status
- Monthly contribution amount: KES 1,000 per member

### 3. `loans-sample.csv`
- **10 loan records** with various purposes and amounts
- Amounts range from KES 2,500 to KES 8,000
- Different statuses: pending, approved, disbursed
- Realistic purposes: business expansion, school fees, medical, rent, etc.
- All set to 10% interest rate
- Due dates spread across Feb-June 2025

## How to Use

### Step 1: Import Members First
1. Go to Bulk Import page
2. Select "Bulk Add Members"
3. Upload `members-sample.csv`
4. Wait for success confirmation
5. All 10 members should be added with default password: **Chama@123**

### Step 2: Import Contributions
1. Select "Bulk Import Contributions"
2. Upload `contributions-sample.csv`
3. All 35 contributions should be imported successfully
4. Total contributions: KES 35,000 (10 members × 3 months + 5 × 1 month)

### Step 3: Import Loans
1. Select "Bulk Import Loans"
2. Upload `loans-sample.csv`
3. All 10 loans should be imported
4. Total loan amount: KES 49,000

## Expected Results

After importing all three files:
- ✅ **10 members** registered
- ✅ **35 contributions** recorded (KES 35,000 total)
- ✅ **10 loans** created (KES 49,000 total)
- ✅ Members can login with their email and password "Chama@123"

## Testing Scenarios

### Scenario 1: Successful Import
Use the files as-is to test successful bulk import flow

### Scenario 2: Duplicate Detection
Try uploading `members-sample.csv` twice - should fail with duplicate email errors

### Scenario 3: Missing Member Error
1. Skip Step 1 (don't import members)
2. Try importing contributions directly
3. Should fail because member emails don't exist

### Scenario 4: Duplicate Contribution
1. Import contributions successfully
2. Try uploading `contributions-sample.csv` again
3. Should fail with duplicate contribution errors (same member + month + year)

### Scenario 5: Invalid Data
Modify a CSV file to test validation:
- Remove required fields
- Use invalid email formats
- Use non-numeric amounts
- Use invalid dates

## Member Details

| Name | Email | Phone | Location |
|------|-------|-------|----------|
| Grace Wanjiru | grace.wanjiru@gmail.com | 0712345678 | Nairobi |
| Peter Kamau | peter.kamau@gmail.com | 0723456789 | Kiambu |
| Mary Akinyi | mary.akinyi@gmail.com | 0734567890 | Kisumu |
| David Mwangi | david.mwangi@gmail.com | 0745678901 | Nakuru |
| Jane Nyambura | jane.nyambura@gmail.com | 0756789012 | Thika |
| Samuel Ochieng | samuel.ochieng@gmail.com | 0767890123 | Eldoret |
| Lucy Wambui | lucy.wambui@gmail.com | 0778901234 | Mombasa |
| Joseph Kiptoo | joseph.kiptoo@gmail.com | 0789012345 | Nairobi |
| Ann Wangari | ann.wangari@gmail.com | 0790123456 | Machakos |
| Michael Otieno | michael.otieno@gmail.com | 0701234567 | Nairobi |

## Notes

- All members default password: **Chama@123**
- Contribution amounts: KES 1,000/month
- Loan interest rate: 10%
- All test data uses realistic Kenyan names, phone numbers, and locations
- Phone numbers follow Safaricom format (07XXXXXXXX)
- M-Pesa transaction refs format: Q followed by 8 digits

## File Locations

Access test files at:
- `http://localhost:3001/test-data/members-sample.csv`
- `http://localhost:3001/test-data/contributions-sample.csv`
- `http://localhost:3001/test-data/loans-sample.csv`

Or find them in your project at:
```
apps/admin/public/test-data/
```

## Need More Data?

You can easily modify these CSVs to add more:
- Duplicate rows for more contributions (change month/year)
- Add more members
- Create loans with different statuses
- Test with larger datasets (100+ rows)

Happy Testing! 🎉
