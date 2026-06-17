Bug Summary

Within the Client page, the State/Territory column in the Client Locations table is not displaying any values in the UI. The data is saved correctly in the system, but it is not rendering in the Client Locations table for any location record.

✅ Login & Website DATA

URL: https://app.dmerocket.com/

Credentials : Username = admin@selectortho.net
              Password = Password123!

✅ Execution Test Steps

Pre-condition: User is logged into the application and has access to the Client module.

Step 1 - Navigate to the Client section from the main menu.

Step 2 - Open an existing Client record (e.g., Chatham Orthopaedic Associates).

Step 3 - Scroll down to the Client Locations section on the Client details page.

Step 4 - Observe the Client Locations table which lists all locations associated with the client.

Step 5 - Locate the State/Territory column in the table.

Step 6 - Verify whether the State/Territory value is displayed for each location row.

🔴 Bug Reproduction (Current Behavior)

When viewing a Client record, the State/Territory column in the Client Locations table appears blank for all location entries. The State/Territory value is saved in the system (as confirmed via the edit form), but it does not render in the table view. All other columns — Location Name, NPI, PTAN, Address Line 1, City, Postal Code, Phone Number, Ext., Status, and Actions — display their values correctly.

🟢 Expected Behavior

The State/Territory value saved for each Client Location should be visible in the State/Territory column of the Client Locations table.

The column should display the correct state or territory corresponding to each location record.
The data should render consistently alongside other location fields in the table.
No data loss should occur — the saved value should be both stored and displayed correctly in the UI.
