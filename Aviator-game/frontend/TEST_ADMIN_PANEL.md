# Admin Panel Testing Guide

## Prerequisites

1. Backend server running on port 8000 (or configured port)
2. MongoDB connected
3. Admin user created
4. Frontend running on port 3000

## Test Scenarios

### 1. Login Test

- [ ] Navigate to `/login`
- [ ] Enter admin credentials
- [ ] Verify successful login
- [ ] Check if redirected to `/dashboard`
- [ ] Verify JWT token is stored in cookies

### 2. Dashboard Test

- [ ] Verify all stat cards load
- [ ] Check "Total Users" count
- [ ] Check "Pending KYC" count
- [ ] Check "Total Recharges" count
- [ ] Check "Total Withdrawals" count
- [ ] Check "Pending Recharges" count
- [ ] Check "Pending Withdrawals" count
- [ ] Click on each card to verify navigation

### 3. Pending Requests Test

#### Recharge Tab

- [ ] Navigate to `/request`
- [ ] Verify "Recharges" tab is active by default
- [ ] Check if pending recharges are displayed
- [ ] Verify user information is shown correctly
- [ ] Test "Approve" button:
  - Click approve on a recharge
  - Verify toast notification appears
  - Check if user balance increased in database
  - Verify transaction status changed to "approved"
- [ ] Test "Reject" button:
  - Click reject on a recharge
  - Confirm the action in dialog
  - Verify toast notification appears
  - Check if transaction status changed to "rejected"
  - Verify user balance did NOT change

#### Withdrawal Tab

- [ ] Click on "Withdrawals" tab
- [ ] Verify pending withdrawals are displayed
- [ ] Test "Approve" button:
  - Click approve on a withdrawal
  - Verify toast notification appears
  - Check if user balance decreased in database
  - Verify transaction status changed to "approved"
- [ ] Test "Reject" button:
  - Click reject on a withdrawal
  - Confirm the action in dialog
  - Verify toast notification appears
  - Check if transaction status changed to "rejected"
  - Verify user balance did NOT change
- [ ] Test insufficient balance scenario:
  - Try to approve withdrawal > user balance
  - Verify error message appears
  - Check transaction is rejected

#### KYC Tab

- [ ] Click on "KYC Requests" tab
- [ ] Verify pending KYC requests are displayed
- [ ] Test "View" button:
  - Click view icon
  - Verify navigation to KYC details page
- [ ] Test "Approve" button:
  - Click approve on a KYC request
  - Verify toast notification appears
  - Check if KYC status changed to "approved"
- [ ] Test "Reject" button:
  - Click reject on a KYC request
  - Verify toast notification appears
  - Check if KYC status changed to "rejected"

### 4. Users Management Test

- [ ] Navigate to `/users`
- [ ] Verify user list is displayed
- [ ] Test search functionality
- [ ] Test pagination (Next/Previous buttons)
- [ ] Click on "View" icon to see user details
- [ ] Test delete user functionality

### 5. Transaction History Test

#### Recharge History

- [ ] Navigate to `/rechargehistory`
- [ ] Verify all recharges are displayed (not just pending)
- [ ] Check if approved/rejected status is shown
- [ ] Test search functionality
- [ ] Test pagination

#### Withdrawal History

- [ ] Navigate to `/withdrawhistory`
- [ ] Verify all withdrawals are displayed
- [ ] Check if approved/rejected status is shown
- [ ] Test search functionality
- [ ] Test pagination

### 6. Game Control Test

- [ ] Navigate to `/crashpercentage`
- [ ] Verify crash percentage list is displayed
- [ ] Test add new crash percentage
- [ ] Test edit crash percentage
- [ ] Test delete crash percentage

### 7. Settings Test

#### Game Settings

- [ ] Navigate to `/aviatorsetting`
- [ ] Verify game settings are displayed
- [ ] Test update game settings

#### Bank Details

- [ ] Navigate to `/bankdetails`
- [ ] Verify bank details are displayed
- [ ] Test add/edit bank details

#### Promo Codes

- [ ] Navigate to `/promocodesetting`
- [ ] Verify promo codes are displayed
- [ ] Test add new promo code
- [ ] Test edit promo code
- [ ] Test delete promo code

### 8. Sidebar Navigation Test

- [ ] Test all sidebar links
- [ ] Verify active state highlighting
- [ ] Test collapsible menus (Users, Settings)
- [ ] Test mobile responsiveness (toggle sidebar)

### 9. Error Handling Test

- [ ] Test with invalid token (logout and try to access protected routes)
- [ ] Test with network error (disconnect internet)
- [ ] Test with invalid data (try to approve non-existent transaction)
- [ ] Verify error messages are user-friendly

### 10. Performance Test

- [ ] Check page load times
- [ ] Verify no memory leaks
- [ ] Test with large datasets (100+ users, transactions)
- [ ] Check if pagination works smoothly

## Database Verification Queries

### Check User Balance After Recharge Approval

```javascript
db.user.findOne({ _id: ObjectId("USER_ID") });
// Verify balance increased by recharge amount
```

### Check User Balance After Withdrawal Approval

```javascript
db.user.findOne({ _id: ObjectId("USER_ID") });
// Verify balance decreased by withdrawal amount
```

### Check Transaction Status

```javascript
db.transaction.findOne({ _id: ObjectId("TRANSACTION_ID") });
// Verify status is "approved" or "rejected"
```

### Check KYC Status

```javascript
db.userbankdetails.findOne({ _id: ObjectId("KYC_ID") });
// Verify kycstatus is "approved" or "rejected"
```

## Common Issues and Solutions

### Issue: "Access denied. No token provided"

**Solution**: Make sure you're logged in and JWT token is in cookies

### Issue: Dashboard stats not loading

**Solution**: Check if backend APIs are accessible and returning correct data

### Issue: Approve/Reject not working

**Solution**:

1. Check browser console for errors
2. Verify backend API endpoints are working
3. Check if user has sufficient balance for withdrawals

### Issue: Toast notifications not appearing

**Solution**: Make sure react-toastify is properly installed and ToastContainer is rendered

### Issue: Pagination not working

**Solution**: Check if count is being returned from API correctly

## Success Criteria

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Database updates correctly
- [ ] User experience is smooth
- [ ] Error handling works properly
- [ ] Mobile responsive design works

## Notes

- Test with different user roles if implemented
- Test with different browsers (Chrome, Firefox, Safari)
- Test on different devices (Desktop, Tablet, Mobile)
- Monitor backend logs for any errors
- Check network tab for API call responses
