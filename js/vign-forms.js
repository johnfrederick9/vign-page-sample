/* =========================================================
   VIGN inspection forms: ONE copy for the Staff Office, Inspector and Client previews.
   Copied from the main system (vignserver/sql/migrations 0005-0009), same sections,
   same questions, same order. Mystery Shop is still a sample (not in the main system yet).

   Each section: { name, list: [ [code, label, type, options, optional] ] }
     type  r    = rated 1-4 / N/O / N/A (counts in the score, weight 1)
           sel  = pick one          yn  = Yes / No
           txt  = short text        num = number        area = longer text
     optional = true when the inspector may leave it blank.
   A section where every question is an optional Yes / No shows as "tick all that apply".
   ========================================================= */
(function () {
'use strict';
var F = {
    residential: { title: 'Residential Property Inspection', service: 'property',
        desc: 'Single-family home, condominium, townhouse, multifamily unit. Visual condition assessment.',
        sections: [
            { name: 'Observed condition checklist', list: [
                ['roof', 'Roof visible from ground / drainage', 'r'], ['foundation', 'Foundation / exterior walls', 'r'], ['doors_windows', 'Doors / windows / locks', 'r'],
                ['siding', 'Siding / paint / exterior finish', 'r'], ['driveway', 'Driveway / walks / stairs / railings', 'r'], ['yard', 'Yard / trees / fencing', 'r'],
                ['interior', 'Ceilings / walls / floors', 'r'], ['kitchen', 'Kitchen / cabinets / fixtures', 'r'], ['bathrooms', 'Bathrooms / plumbing leaks visible', 'r'],
                ['hvac', 'Heating / cooling (visual only)', 'r'], ['electrical', 'Electrical outlets / panels (visual only)', 'r'], ['alarms', 'Smoke / CO alarms (presence only)', 'r'],
                ['water', 'Water intrusion / stains / mold-like growth', 'r'], ['pests', 'Pest / vandalism indicators', 'r']] },
            { name: 'Occupancy and utilities', list: [
                ['occupancy', 'Occupancy indication', 'sel', ['Occupied', 'Vacant', 'Uncertain']],
                ['utilities_on', 'Utilities visibly on', 'sel', ['Yes', 'No', 'Unknown']]] }] },
    commercial: { title: 'Commercial Property Inspection', service: 'property',
        desc: 'Office, retail, restaurant, warehouse, mixed-use. Non-invasive condition assessment.',
        sections: [
            { name: 'Observed condition checklist', list: [
                ['storefront', 'Storefront / facade / signage', 'r'], ['roof', 'Roof / gutters (visible only)', 'r'], ['parking', 'Parking / pavement / access', 'r'],
                ['grounds', 'Landscaping / grounds / drainage', 'r'], ['doors_security', 'Doors / glazing / security', 'r'], ['common_areas', 'Common areas / hallways / stairs', 'r'],
                ['interior', 'Interior walls / ceilings / flooring', 'r'], ['restrooms', 'Restrooms / water fixtures', 'r'], ['loading', 'Loading / service areas', 'r'],
                ['hvac', 'HVAC equipment (visual only)', 'r'], ['lighting', 'Lighting / visible wiring', 'r'], ['fire_safety', 'Fire extinguishers / exits (presence / obstruction)', 'r'],
                ['accessibility', 'Accessibility concerns observed', 'r'], ['leaks', 'Leaks / odors / water damage', 'r'], ['sanitation', 'Sanitation / waste / pests', 'r']] },
            { name: 'Business status', list: [
                ['business_status', 'Business status observed', 'sel', ['Operating', 'Closed', 'Unclear']],
                ['tenant_remarks', 'Tenant / contact remarks', 'txt', null, true]] }] },
    vacant: { title: 'Vacant Property / Preservation Inspection', service: 'property',
        desc: 'Vacant, foreclosure-risk, REO, lender-owned. Exterior or authorized-access occupancy and preservation check.',
        sections: [
            { name: 'Occupancy and preservation indicators', list: [
                ['occupancy', 'Occupancy', 'sel', ['Appears occupied', 'Appears vacant', 'Unable to determine']],
                ['inspection_type', 'Inspection type', 'sel', ['Drive-by', 'Walk-up', 'Authorized interior']]] },
            { name: 'Observed condition checklist', list: [
                ['openings', 'Boarded / broken openings', 'r'], ['entry_security', 'Locks / entry security / forced entry', 'r'], ['doors_windows', 'Doors / windows / garage', 'r'],
                ['roof', 'Roof / gutters / structural indicators', 'r'], ['standing_water', 'Standing water / drainage', 'r'], ['lawn', 'Lawn growth / vegetation / trees', 'r'],
                ['debris', 'Trash / debris / dumped items', 'r'], ['vandalism', 'Graffiti / vandalism / trespass signs', 'r'], ['water_damage', 'Visible water damage / freezing risk', 'r'],
                ['utilities', 'Utilities / meters (visual indicators)', 'r'], ['open_hazards', 'Pool / open hazards / exposed holes', 'r'], ['mailbox', 'Mailbox / notices / deliveries', 'r'],
                ['storm_damage', 'Fire / storm / wind damage', 'r'], ['notices', 'HOA / municipal notices observed', 'r']] },
            { name: 'Preservation request', list: [
                ['preserve_lawn', 'Lawn', 'yn', null, true], ['preserve_debris', 'Debris', 'yn', null, true], ['preserve_board', 'Board / secure', 'yn', null, true],
                ['preserve_winterize', 'Winterization review', 'yn', null, true], ['preserve_other', 'Other', 'txt', null, true]] }] },
    rental: { title: 'Rental Move-In / Move-Out Condition Report', service: 'property',
        desc: 'Apartment, rental home, student housing, property management. Room-by-room condition record.',
        sections: [
            { name: 'Inspection details', list: [
                ['inspection_kind', 'Inspection type', 'sel', ['Move-in', 'Move-out']], ['unit_number', 'Unit #', 'txt', null, true],
                ['tenant_present', 'Tenant present?', 'yn'], ['keys_recorded', 'Keys / remotes recorded', 'txt', null, true],
                ['meter_electric', 'Meter reading: Electric', 'num', null, true], ['meter_gas', 'Meter reading: Gas', 'num', null, true], ['meter_water', 'Meter reading: Water', 'num', null, true]] },
            { name: 'Room-by-room condition', list: [
                ['entry', 'Entry / locks / keys', 'r'], ['living_room', 'Living room - walls / floors', 'r'], ['kitchen_cabinets', 'Kitchen - cabinets / counters', 'r'],
                ['kitchen_appliances', 'Kitchen - appliances (visual)', 'r'], ['bedrooms', 'Bedroom(s) - walls / floors', 'r'], ['closets', 'Closets / doors / windows', 'r'],
                ['bathrooms', 'Bathroom(s) / fixtures', 'r'], ['laundry', 'Laundry / utility space', 'r'], ['electrical', 'Lighting / switches / outlets', 'r'],
                ['hvac', 'HVAC / thermostat (visual)', 'r'], ['balcony', 'Balcony / porch / patio', 'r'], ['garage', 'Garage / storage / parking', 'r'],
                ['cleanliness', 'Cleanliness / trash', 'r'], ['existing_damage', 'Existing damage / stains', 'r']] },
            { name: 'Changes and tenant acknowledgement', list: [
                ['change_since_prior', 'Pre-existing condition / change since prior report', 'area', null, true],
                ['tenant_ack_name', 'Tenant acknowledgement: name', 'txt', null, true], ['tenant_ack_signed', 'Tenant signed the acknowledgement', 'yn', null, true]] }] },
    exterior: { title: 'Exterior / Drive-By Property Inspection', service: 'property',
        desc: 'Mortgage servicing, insurance, investor, collateral verification. Exterior-only, from the public right-of-way.',
        sections: [
            { name: 'Inspection vantage and photos', list: [
                ['vantage', 'Inspection vantage', 'sel', ['Public right-of-way', 'Authorized property access']],
                ['photo_front', 'Photo taken: Front', 'yn', null, true], ['photo_side', 'Photo taken: Side', 'yn', null, true], ['photo_rear', 'Photo taken: Rear', 'yn', null, true]] },
            { name: 'Visible exterior indicators', list: [
                ['exterior', 'Building exterior / paint / siding', 'r'], ['roofline', 'Roofline / gutters (ground view)', 'r'], ['foundation', 'Foundation / cracks visible', 'r'],
                ['windows_doors', 'Windows / doors / boarded areas', 'r'], ['lawn', 'Lawn / weeds / trees / branches', 'r'], ['driveway', 'Driveway / sidewalk / parking', 'r'],
                ['fences', 'Fences / retaining walls', 'r'], ['storm_damage', 'Storm / fire / water damage', 'r'], ['debris', 'Trash / dumped objects', 'r'],
                ['signs', 'For-sale / rental / notice signs', 'r'], ['activity', 'Activity / occupancy indicators', 'r'], ['address_confirm', 'Address confirmation / unit identifiers', 'r']] },
            { name: 'Occupancy and exterior condition', list: [
                ['occupancy', 'Occupancy', 'sel', ['Appears occupied', 'Appears vacant', 'Undetermined']],
                ['exterior_condition', 'Exterior condition', 'sel', ['Maintained', 'Unmaintained']]] }] },
    mystery: { title: 'Mystery Shop Visit (sample form)', service: 'mystery', sample: true,
        desc: 'Sample only. The mystery shop form is not in the main system yet.',
        sections: [
            { name: 'Visit checklist', list: [
                ['greeting', 'Greeting and first impression', 'r'], ['knowledge', 'Staff knowledge and helpfulness', 'r'], ['wait', 'Wait time and speed of service', 'r'],
                ['clean', 'Store cleanliness and presentation', 'r'], ['policy', 'Policy and procedure compliance', 'r'], ['checkout', 'Checkout and closing experience', 'r']] },
            { name: 'Visit details', list: [
                ['offered_help', 'Were you offered help without asking?', 'yn'], ['receipt', 'Receipt kept?', 'yn']] }] }
};

/* Helpers every portal uses */
F.order = ['residential', 'commercial', 'vacant', 'rental', 'exterior', 'mystery'];
F.items = function (k) { var out = []; F[k].sections.forEach(function (s) { s.list.forEach(function (q) { if (q[2] === 'r') out.push(q[1]); }); }); return out; };
F.ratingSection = function (k) { var s = F[k].sections.filter(function (x) { return x.list.some(function (q) { return q[2] === 'r'; }); })[0]; return s ? s.name : ''; };
/* the other questions, split into those asked before the checklist and after it */
F.fields = function (k, where) {
    var out = [], seen = false;
    F[k].sections.forEach(function (s) {
        var rated = s.list.some(function (q) { return q[2] === 'r'; });
        if (rated) { seen = true; return; }
        if ((where === 'before') === !seen) out.push({ name: s.name, ticks: s.list.every(function (q) { return q[4] && (q[2] === 'yn' || q[2] === 'txt'); }) && s.list.some(function (q) { return q[2] === 'yn'; }), list: s.list });
    });
    return out;
};
/* visit header + footer, same as the main system (inspections table) */
F.WEATHER = ['Clear', 'Cloudy', 'Rain', 'Snow', 'Fog', 'Windy', 'Hot', 'Cold'];
F.ACCESS = ['Exterior only', 'Interior authorized', 'No access', 'Other'];

window.VIGNFORMS = F;
})();
