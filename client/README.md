Local dev access from phone
===========================

To access the client app from another device on your local network (for example, your phone), do the following:

1. Find your machine's LAN IP address (e.g., 192.168.1.100).
2. In the `client` folder create a file named `.env` (or copy `.env.example`) and set:

VITE_API_URL=http://<YOUR_IP>:5000/api/auth

3. Start the server and client dev servers.

On Windows PowerShell (run from repository root):

cd client; npm run dev

And in a separate terminal for the API server:

cd server; npm run dev

4. Open the client in your phone's browser at http://<YOUR_IP>:5173

Notes:
- The Vite dev server is configured to bind to 0.0.0.0 (all interfaces) and uses port 5173 by default.
- The Express API server is configured to bind to 0.0.0.0 and port 5000 by default.
- Ensure Windows Firewall allows inbound connections on ports 5173 and 5000 or temporarily disable it for testing.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
