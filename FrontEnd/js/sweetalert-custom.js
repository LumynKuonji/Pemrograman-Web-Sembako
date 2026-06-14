const AppAlert = {
  show({ type, title, message, btnText = "Oke", onClose }) {
    const iconMap = {
      success: "success",
      error: "error",
      warning: "warning",
      warn: "warning",
      info: "info",
      question: "question",
    };
    const swalIcon = iconMap[type] || undefined;
    return Swal.fire({
      icon: swalIcon,
      title: title || "",
      html: message || "",
      confirmButtonText: btnText,
      showCloseButton: true,
      focusConfirm: true,
      scrollbarPadding: false,
      showClass: {
        popup: "animate-custom-show",
      },
      hideClass: {
        popup: "animate-custom-hide",
      },
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
        closeButton: "custom-swal-close-btn",
      },
    }).then((result) => {
      if (onClose) onClose();
      return result;
    });
  },

  confirm({
    type,
    title,
    message,
    confirmText = "Ya",
    cancelText = "Batal",
    danger = false,
    onConfirm,
    onCancel,
  }) {
    const iconMap = {
      success: "success",
      error: "error",
      warning: "warning",
      warn: "warning",
      info: "info",
      question: "question",
    };
    const swalIcon = iconMap[type] || undefined;
    return Swal.fire({
      icon: swalIcon,
      title: title || "",
      html: message || "",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      focusConfirm: !danger,
      focusCancel: danger,
      scrollbarPadding: false,
      showClass: {
        popup: "animate-custom-show",
      },
      hideClass: {
        popup: "animate-custom-hide",
      },
      customClass: {
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        htmlContainer: "custom-swal-html",
        confirmButton: danger ? "custom-swal-danger-confirm" : "",
        closeButton: "custom-swal-close-btn",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (onConfirm) onConfirm();
      } else {
        if (onCancel) onCancel();
      }
      return result;
    });
  },

  toast(message, position = "top-end", duration = 3000) {
    const Toast = Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      showClass: {
        popup: "animate-toast-show",
      },
      hideClass: {
        popup: "animate-toast-hide",
      },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
      customClass: {
        popup: "custom-swal-toast",
        title: "custom-swal-toast-title",
      },
    });

    return Toast.fire({
      title: message,
    });
  },
};
