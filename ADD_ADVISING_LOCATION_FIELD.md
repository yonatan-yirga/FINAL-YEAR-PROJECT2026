# Add Advising Location Field to Database

## Issue
The `advising_location` field exists in the AdvisorProfile model but needs to be added to the database.

## Solution
Run the following commands to create and apply the migration:

### Step 1: Create Migration
```bash
cd Backend
python manage.py makemigrations accounts
```

### Step 2: Apply Migration
```bash
python manage.py migrate accounts
```

### Expected Output
```
Migrations for 'accounts':
  accounts/migrations/XXXX_add_advising_location.py
    - Add field advising_location to advisorprofile

Operations to perform:
  Apply all migrations: accounts
Running migrations:
  Applying accounts.XXXX_add_advising_location... OK
```

## What This Does
- Adds the `advising_location` TextField to the `advisor_profiles` table in PostgreSQL
- Allows advisors to save their preferred advising location
- Field is optional (blank=True, null=True)

## After Migration
1. Restart the Django server
2. Advisors can now save their advising location
3. The location will persist in the database
4. The profile page will display saved locations

## Verification
After running the migration, you can verify it worked by:

1. **Check in Django Admin**:
   - Go to http://localhost:8000/admin/
   - Navigate to Advisor Profiles
   - You should see the "Advising location" field

2. **Check in PostgreSQL**:
   ```sql
   \d advisor_profiles
   ```
   You should see the `advising_location` column

3. **Test in the App**:
   - Login as an advisor
   - Go to Profile page
   - Enter a location
   - Click Save
   - Refresh the page - location should still be there

## Troubleshooting

### If migration fails:
```bash
# Check for conflicts
python manage.py showmigrations accounts

# If needed, fake the migration (if field already exists)
python manage.py migrate accounts --fake
```

### If field still doesn't save:
1. Check Django server logs for errors
2. Verify the authService.updateProfile() is sending advising_location
3. Check the backend view is accepting and saving the field

---

**Status**: Migration needed
**Field**: advising_location (TextField, optional)
**Table**: advisor_profiles
**Model**: AdvisorProfile
