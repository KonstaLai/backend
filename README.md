# Lost & Found -Campus Web App

A web application designed to help students and staff easily report and recover lost or found items on campus. This project follows accessibility best practices and is built with **Node.js**, **Express**, **MongoDB**, and **express-handlebars**, with full CRUD functionality, and a responsive, user-friendly interface.

## Features

### Item Management (CRUD)
- Create, read, update, and delete listings for lost or found items
- Include item name, description, photo upload, location, and date

###  Authentication & Roles
- User registration and login
- Role-based access control:
  - Regular users: post and claim items
  - Admins: moderate, verify, or remove any entry

###  Search & Filter
- Keyword search for items
- Filter by category (e.g., electronics, books, clothing)
- Filter by status (Lost or Found)

## Accessibility
- Semantic HTML5 structure for assistive technologies
- ARIA roles and live regions for dynamic content 
- Keyboard-navigable UI with clear focus indicators
- Screen reader testing (NVDA)


## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Express-Handlebars (server-side rendering)
- express-session (authentication)
- Express-validator (input validation)



#  Installation
```
git clone https://github.com/KonstaLai/backend.git

cd backend

```

## Install dependencies
```
npm install

or

yarn install
```

## Running the App
```
npm run dev

or

yarn dev
```