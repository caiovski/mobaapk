# Tasks: Pet Scheduling & Admin Operations

## Phase 1: Client App - Pet Registration
- [ ] Create Pet Interface (`IPet`) and DTOs.
- [ ] Implement `PetRepository` to handle Firestore CRUD for `pets` collection.
- [ ] Build "Add Pet" Screen (Form with validation).
- [ ] Build "My Pets" Screen (List of registered pets).
- [ ] Integrate image upload for Pet Photos (Firebase Storage).

## Phase 2: Client App - Service Scheduling
- [ ] Create Appointment Interface (`IAppointment`).
- [ ] Implement `AppointmentRepository` in Firestore.
- [ ] Create Scheduling Service to calculate available slots based on date, existing appointments, and business hours.
- [ ] Build Scheduling Flow Screens (Select Pet, Select Service, Select Date/Time).
- [ ] Add pricing logic based on Pet Size + Service.

## Phase 3: Admin App/Web - Operational Schedule
- [ ] Create Admin Task Interface (`IAdminTask`).
- [ ] Implement `AdminTaskRepository` in Firestore.
- [ ] Build Admin Agenda Screen (List of tasks like bills, employees, products).
- [ ] Add task creation and completion functionality.

## Phase 4: Admin App/Web - Daily Pet Queue
- [ ] Implement logic to fetch today's appointments and order them by time.
- [ ] Build Daily Queue UI component (Timeline or List view).
- [ ] Add ability to update appointment status (e.g., from `SCHEDULED` to `IN_PROGRESS` to `COMPLETED`).
- [ ] Integrate with the Admin Dashboard.
