
# 🎓 Pak School Management System

A modern, cross-platform **School Management Desktop App** built with **Electron**, **Vite**, and **Tailwind CSS**.  
This app provides student admission, fee management, result generation with report cards, data export, and more — all in a lightweight desktop environment.

---

## 🚀 Tech Stack

- ⚡ [Vite](https://vitejs.dev/) — Fast frontend tooling and bundler
- 🖥️ [Electron](https://www.electronjs.org/) — Cross-platform desktop application framework
- 🎨 [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework for rapid UI design
- 🔧 [PostCSS](https://postcss.org/) — CSS post-processing tool (used with Tailwind)
- 📦 Node.js & npm — Dependency and script management

---

## 📁 Folder Structure

```
PAK-SCHOOL-MANAGEMENT/
├── .vscode/                 # VS Code configuration files
├── dist/                    # Production build output (frontend or combined)
├── dist-electron/           # Electron production build output
├── node_modules/            # npm dependencies
├── public/                  # Static assets (favicons, index.html, etc.)
├── scripts/                 # Custom scripts (build, setup, etc.)
├── src/                     # Source code (components, pages, logic)
│   ├── main/                # Electron Main process files
│   ├── renderer/            # Frontend source files (React/Vue/Svelte/etc.)
│   └── assets/              # Images, fonts, and other assets
├── .env                     # Environment variables
├── .gitignore               # Git ignore rules
├── .gitattributes           # Git attribute settings
├── electron.vite.config.js  # Electron + Vite config
├── vite.config.js           # Vite frontend config
├── vite.main.config.js      # Vite config for Electron main process
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS plugins config (Tailwind)
├── package.json             # npm metadata, dependencies, and scripts
├── package-lock.json        # Locked dependency versions
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/rohaib11/pak-school-management.git
   cd pak-school-management
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server (frontend + Electron):

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

---

## 📄 Available Scripts

| Script          | Description                             |
|-----------------|---------------------------------------|
| `npm run dev`   | Run the app in development mode        |
| `npm run build` | Build production-ready frontend & Electron apps |
| `npm run lint`  | Lint source files (if configured)      |
| `npm run electron` | Start Electron with frontend          |

---

## 📌 Features

- Student admission management
- Fee payment tracking
- Result generation with printable report cards
- Search students by roll number or name
- Export student data to Excel or PDF
- Fee due notifications
- Offline-first desktop application
- Clean, modern UI with Tailwind CSS
- Cross-platform support via Electron

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root to configure environment-specific settings.  
Example entries:

```
VITE_API_URL=http://localhost:3000/api
ELECTRON_START_URL=http://localhost:3000
```

---

## 📸 Screenshots

*Add screenshots here when ready.*

---

## 📦 Dependencies & Tooling

- Vite handles frontend development and bundling with hot reload.
- Electron packages your app for Windows, MacOS, and Linux.
- Tailwind CSS for styling using utility classes.
- PostCSS processes CSS with plugins, including Tailwind.
- Node.js for managing packages and running scripts.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check [issues page](https://github.com/rohaib11/pak-school-management/issues).

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Muhammad Rohaib**  
- GitHub: [rohaib11](https://github.com/rohaib11)  
- LinkedIn: [Muhammad Rohaib](https://linkedin.com/in/muhammadrohaib)  

---

Thank you for using the Pak School Management System! 🚀
