# Proposal: Pet Scheduling & Admin Operations

## 1. Goal
Implement a comprehensive scheduling and registration system for both clients and administrators. 
- For the **Client App**: Allow users to register their pets with detailed characteristics and schedule services (baths, grooming) in available time slots.
- For the **Admin App/Web**: Provide a daily operational schedule (agenda) for shop management (bills, employees, etc.) and a daily queue of scheduled pets respecting the shop's business hours.

## 2. Requirements

### Client App
- **Pet Registration**: 
  - Fields: Name, Breed, Age (optional), Photo, Weight (approximate), Size (Small, Medium, Large).
  - Business Rule: Service pricing varies according to the pet's size.
- **Service Scheduling**:
  - Select a registered pet.
  - Select service type: Bath, Hygienic Grooming, or Both.
  - Choose from available time slots.
  - Business Rules:
    - Time slots are dynamically calculated based on a 40-60 minute duration per pet.
    - Prevent double booking if a slot is already taken by another client.

### Admin App / Web
- **Operational Schedule (Agenda)**:
  - Calendar/Task management for shop operations (e.g., pay electricity bill, rent, water, employee payments, product inventory).
- **Daily Pet Queue**:
  - View dogs scheduled for services on the current day, organized by time.
  - Business Rules for Business Hours:
    - Monday to Friday: 08:00 to 18:00
    - Saturdays and Holidays: 08:00 to 13:00
    - Sundays: Closed (no scheduling allowed).

## 3. Success Metrics
- Clients can successfully register pets and book services without conflicts.
- Admins have a clear overview of both shop operations and the daily pet service queue.
- No double bookings in the system.
