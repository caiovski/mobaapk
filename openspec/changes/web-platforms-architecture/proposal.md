# Proposal: Web Platforms Architecture (TCC Scope)

## 1. Goal
Expand the existing offline-first mobile application ecosystem into a fully integrated Omnichannel platform by introducing two new web applications: `web-admin` and `web-cliente`.

## 2. Academic Context (TCC)
This documentation serves not only as a technical roadmap but also as the architectural foundation for the academic research and defense of the **Trabalho de Conclusão de Curso (TCC)**. It demonstrates advanced software engineering concepts such as Omnichannel retail, Offline-First synchronization, and centralized state management via Cloud Databases.

## 3. The Problem & Business Strategy

### The `web-admin` (Operational Efficiency)
- **Problem**: Mobile apps are great for on-the-go management, but performing heavy operational tasks (like a physical Point of Sale / PDV, or complex financial reporting) on a mobile device is slow and prone to errors.
- **Solution**: A dedicated Web Admin platform optimized for desktop screens, keyboard, and mouse/barcode scanner usage.

### The `web-cliente` (Marketing Funnel & Acquisition)
- **Problem**: Forcing every new customer to download an app creates a high barrier to entry (friction) for a first purchase.
- **Solution**: A simplified Web Client platform that allows quick, frictionless purchases.
- **Marketing Strategy**: The Web Client acts as the top of the funnel. It intentionally omits premium features (e.g., real-time map tracking of deliveries, push notifications, and loyalty points) to heavily incentivize the user to download the Native App for the "full experience".

## 4. Success Metrics
- Seamless integration: A product updated on the `web-admin` immediately reflects on `agropet-cliente`, `web-cliente`, and `agropet-admin`.
- Cart Synchronization: Purchases started on the mobile app can be visualized and finished on the web if the user is logged in.
