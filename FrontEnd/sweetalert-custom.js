/**
 * Modern SweetAlert2 Custom Component Wrapper
 * Suitable for HTML, CSS, PHP, Laravel, CodeIgniter, etc.
 * 
 * Dependencies:
 * - SweetAlert2 Library (JS CDN)
 * - sweetalert-custom.css (Custom CSS styles)
 */

const AppAlert = {
    /**
     * Show general alert modal
     * @param {Object} options
     * @param {string} options.type - Alert type ('success'|'error'|'warn'|'info')
     * @param {string} options.title - Alert title
     * @param {string} options.message - Alert message / HTML content
     * @param {string} [options.btnText='Oke'] - Button text
     * @param {function} [options.onClose] - Callback when modal is closed
     */
    show({ type, title, message, btnText = 'Oke', onClose }) {
        const iconMap = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            warn: 'warning',
            info: 'info',
            question: 'question'
        };
        const swalIcon = iconMap[type] || undefined;
        return Swal.fire({
            icon: swalIcon,
            title: title || '',
            html: message || '',
            confirmButtonText: btnText,
            showCloseButton: true,
            focusConfirm: true,
            scrollbarPadding: false,
            showClass: {
                popup: 'animate-custom-show'
            },
            hideClass: {
                popup: 'animate-custom-hide'
            },
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                htmlContainer: 'custom-swal-html',
                closeButton: 'custom-swal-close-btn'
            }
        }).then((result) => {
            if (onClose) onClose();
            return result;
        });
    },

    /**
     * Show confirmation modal with Confirm and Cancel buttons
     * @param {Object} options
     * @param {string} options.type - Modal type ('success'|'error'|'warn'|'info')
     * @param {string} options.title - Modal title
     * @param {string} options.message - Modal message / HTML content
     * @param {string} [options.confirmText='Ya'] - Confirm button text
     * @param {string} [options.cancelText='Batal'] - Cancel button text
     * @param {boolean} [options.danger=false] - If true, style confirm button as danger (red)
     * @param {function} [options.onConfirm] - Callback on confirm button click
     * @param {function} [options.onCancel] - Callback on cancel button click or dismiss
     */
    confirm({ type, title, message, confirmText = 'Ya', cancelText = 'Batal', danger = false, onConfirm, onCancel }) {
        const iconMap = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            warn: 'warning',
            info: 'info',
            question: 'question'
        };
        const swalIcon = iconMap[type] || undefined;
        return Swal.fire({
            icon: swalIcon,
            title: title || '',
            html: message || '',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            focusConfirm: !danger,
            focusCancel: danger,
            scrollbarPadding: false,
            showClass: {
                popup: 'animate-custom-show'
            },
            hideClass: {
                popup: 'animate-custom-hide'
            },
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                htmlContainer: 'custom-swal-html',
                confirmButton: danger ? 'custom-swal-danger-confirm' : '',
                closeButton: 'custom-swal-close-btn'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                if (onConfirm) onConfirm();
            } else {
                if (onCancel) onCancel();
            }
            return result;
        });
    },

    /**
     * Show custom SaaS-like toast notification with white background (NO ICONS)
     * @param {string} message - Toast message
     * @param {'top'|'top-start'|'top-end'|'bottom'|'bottom-start'|'bottom-end'} [position='top-end'] - Toast position on screen
     * @param {number} [duration=3000] - Duration in milliseconds before auto-close
     */
    toast(message, position = 'top-end', duration = 3000) {
        const Toast = Swal.mixin({
            toast: true,
            position: position,
            showConfirmButton: false,
            timer: duration,
            timerProgressBar: true,
            showClass: {
                popup: 'animate-toast-show'
            },
            hideClass: {
                popup: 'animate-toast-hide'
            },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
            customClass: {
                popup: 'custom-swal-toast',
                title: 'custom-swal-toast-title'
            }
        });

        return Toast.fire({
            title: message
        });
    }
};
