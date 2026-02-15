import './admin.css';
import { ToastProvider } from './components/ToastProvider';

export const metadata = {
    title: 'Admin Panel | SPICC',
    description: 'ระบบจัดการหลังบ้าน SPICC',
};

export default function AdminLayout({ children }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}
