# Design: Pet Scheduling & Admin Operations

## 1. Data Models (Firebase/Firestore)

### `pets` Collection
- `id`: string
- `userId`: string (reference to the client)
- `name`: string
- `breed`: string
- `age`: string (optional)
- `weight`: number (approximate)
- `size`: enum (`SMALL`, `MEDIUM`, `LARGE`)
- `photoUrl`: string (optional)

### `appointments` Collection
- `id`: string
- `userId`: string
- `petId`: string
- `serviceType`: enum (`BATH`, `GROOMING`, `BOTH`)
- `date`: timestamp
- `status`: enum (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)
- `price`: number (calculated based on service + pet size)

### `admin_tasks` Collection
- `id`: string
- `title`: string (e.g., "Pagar Luz", "Comprar Shampoo")
- `dueDate`: timestamp
- `status`: enum (`PENDING`, `COMPLETED`)

## 2. API / Services

### Scheduling Logic
- **Available Slots**: Query `appointments` for a given date. Generate slots based on 40-60 min intervals during business hours.
- **Business Hours Enforcement**:
  - Mon-Fri: `08:00 - 18:00`
  - Sat & Holidays: `08:00 - 13:00`
  - Sun: No slots generated.

### Pricing Logic
- Base price for bath / grooming.
- Multiplier or fixed addition based on `pet.size`.

## 3. UI/UX Flow

### Client App
1. **My Pets**: List of registered pets. Floating action button to "Add Pet".
2. **Add Pet Form**: Inputs for all required fields. Image picker for photo.
3. **Scheduling Flow**:
   - Step 1: Select Pet.
   - Step 2: Select Service (Cards for Bath, Grooming, Both).
   - Step 3: Select Date & Time (Calendar + Available Chips).

### Admin App/Web
1. **Dashboard/Agenda**: 
   - Left Panel (or Tab 1): List of operational tasks (Bills, stock).
   - Right Panel (or Tab 2): Timeline view of today's appointments (queue of dogs).
2. **Queue Card**: Shows Pet Photo, Name, Size, Service Type, Client Name, and Status. Action button to move status (e.g., "Start Bath", "Finish").
