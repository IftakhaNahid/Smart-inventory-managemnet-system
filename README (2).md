# 📦 SmartInventory Pro

A lightweight, browser-based inventory management system with login/registration, a sales dashboard, barcode scanning, and email alerts. Built with plain HTML, CSS, and JavaScript, with no build step required.

## ✨ Features

- 🔐 **Authentication**: login and sign-up with Admin / Client roles
- 📊 **Dashboard**: live stats and charts (Chart.js)
- 🛒 **Product management**: add, edit, delete, and sell products
- 🧾 **Sales history** with report generation and data export
- 📷 **Barcode scanner**: camera scanning via HTML5-QRCode, plus manual entry
- 💾 Data stored in the browser's `localStorage` (demo mode, no backend needed)

## 🗂️ Project Structure

```
├── index.html        # Login / Sign-up page (styles + scripts inline)
├── dashboard.html    # Main dashboard (styles + scripts inline)
├── LICENSE
├── .gitignore
└── README.md
```

## 🚀 Getting Started

1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/smartinventory-pro.git
   cd smartinventory-pro
   ```
2. Open `index.html` in a browser, or serve it locally (needed for camera access):
   ```bash
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

### Demo accounts

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin  | admin@example.com   | admin123   |
| Client | client@example.com  | client123  |

> ⚠️ These are demo credentials only. Change them before any real use.

## 🛠️ Tech Stack

HTML5 · CSS3 · Vanilla JavaScript · [Chart.js](https://www.chartjs.org/) · [Font Awesome](https://fontawesome.com/) · [HTML5-QRCode](https://github.com/mebjas/html5-qrcode)

## ⚠️ Known Limitations

- Passwords and data live in `localStorage` in plain text, so this is **not production-secure**.
- Everything runs client-side; there is no backend or server-side validation.
- Moving to a real backend (Node/Express + database + hashed passwords) is the natural next step.

## 🗺️ Roadmap

- [ ] Backend API with JWT auth and password hashing
- [ ] Database storage (PostgreSQL / MongoDB)
- [ ] Role-based permissions enforced server-side
- [ ] CSV/PDF export
- [ ] Unit tests

## 🤝 Contributing

Pull requests are welcome. Fork the repo, create a branch (`git checkout -b feature/my-feature`), commit, push, and open a PR.

## 📄 License

Released under the [MIT License](LICENSE).
