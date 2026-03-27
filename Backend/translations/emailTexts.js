const emailTexts = {
  fr: {
    subject: "Bienvenue sur notre plateforme Algarve Parfume !",
    text: (prenom) => `Bonjour ${prenom}, merci de vous être inscrit sur notre plateforme !`,
    html: (prenom) => `<p>Bonjour <b>${prenom}</b>,</p><p>Merci de vous être inscrit sur notre plateforme !</p>`
  },
  en: {
    subject: "Welcome to our platform Algarve Parfume!",
    text: (prenom) => `Hello ${prenom}, thank you for signing up on our platform!`,
    html: (prenom) => `<p>Hello <b>${prenom}</b>,</p><p>Thank you for signing up on our platform!</p>`
  },
  es: {
    subject: "¡Bienvenido a nuestra plataforma Algarve Parfume!",
    text: (prenom) => `Hola ${prenom}, ¡gracias por registrarte en nuestra plataforma!`,
    html: (prenom) => `<p>Hola <b>${prenom}</b>,</p><p>¡Gracias por registrarte en nuestra plataforma!</p>`
  },
  pt: {
    subject: "Bem-vindo à nossa plataforma Algarve Parfume!",
    text: (prenom) => `Olá ${prenom}, obrigado por se registrar na nossa plataforma!`,
    html: (prenom) => `<p>Olá <b>${prenom}</b>,</p><p>Obrigado por se registrar na nossa plataforma!</p>`
  }
};
const resetEmailTexts = {
  fr: {
    subject: "Réinitialisation de votre mot de passe",
    line1: "Vous avez demandé la réinitialisation de votre mot de passe.",
    line2: "Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :",
    button: "Réinitialiser mon mot de passe",
    expire: "Ce lien expirera dans 15 minutes."
  },
  en: {
    subject: "Password reset request",
    line1: "You requested to reset your password.",
    line2: "Click the button below to set a new password:",
    button: "Reset my password",
    expire: "This link will expire in 15 minutes."
  },
  es: {
    subject: "Solicitud de restablecimiento de contraseña",
    line1: "Has solicitado restablecer tu contraseña.",
    line2: "Haz clic en el botón de abajo para crear una nueva contraseña:",
    button: "Restablecer mi contraseña",
    expire: "Este enlace expirará en 15 minutos."
  },
  pt: {
    subject: "Solicitação de redefinição de senha",
    line1: "Você solicitou redefinir sua senha.",
    line2: "Clique no botão abaixo para criar uma nova senha:",
    button: "Redefinir minha senha",
    expire: "Este link expirará em 15 minutos."
  }
};
const shippedEmailTexts = {
  fr: {
    subject: "Votre commande est expédiée",
    title: "Votre commande est en route !",
    hello: (name) => `Bonjour ${name},`,
    text1: (orderId) => `Votre commande n°${orderId} a été expédiée.`,
    text2: "Vous pouvez suivre votre colis avec le transporteur.",
    button: "Suivre mon colis",
    thanks: "Merci pour votre confiance."
  },

  en: {
    subject: "Your order has been shipped",
    title: "Your order is on the way!",
    hello: (name) => `Hello ${name},`,
    text1: (orderId) => `Your order #${orderId} has been shipped.`,
    text2: "You can track your package with the carrier.",
    button: "Track my package",
    thanks: "Thank you for your trust."
  },

  es: {
    subject: "Tu pedido ha sido enviado",
    title: "¡Tu pedido está en camino!",
    hello: (name) => `Hola ${name},`,
    text1: (orderId) => `Tu pedido n°${orderId} ha sido enviado.`,
    text2: "Puedes seguir tu paquete con el transportista.",
    button: "Seguir mi paquete",
    thanks: "Gracias por tu confianza."
  },

  pt: {
    subject: "Seu pedido foi enviado",
    title: "Seu pedido está a caminho!",
    hello: (name) => `Olá ${name},`,
    text1: (orderId) => `Seu pedido nº${orderId} foi enviado.`,
    text2: "Você pode acompanhar seu pacote com a transportadora.",
    button: "Rastrear meu pacote",
    thanks: "Obrigado pela sua confiança."
  }
};
const deliveredEmailTexts = {
  fr: {
    subject: "Votre commande a été livrée",
    title: "Commande livrée",
    hello: (name) => `Bonjour ${name},`,
    text1: (orderId) => `Votre commande n°${orderId} a bien été livrée.`,
    text2: "Nous espérons que vous apprécierez votre achat.",
    button: "Se connecter à mon compte"
  },

  en: {
    subject: "Your order has been delivered",
    title: "Order delivered",
    hello: (name) => `Hello ${name},`,
    text1: (orderId) => `Your order #${orderId} has been delivered.`,
    text2: "We hope you enjoy your purchase.",
    button: "Login to my account"
  },

  es: {
    subject: "Tu pedido ha sido entregado",
    title: "Pedido entregado",
    hello: (name) => `Hola ${name},`,
    text1: (orderId) => `Tu pedido n°${orderId} ha sido entregado.`,
    text2: "Esperamos que disfrutes tu compra.",
    button: "Iniciar sesión en mi cuenta"
  },

  pt: {
    subject: "Seu pedido foi entregue",
    title: "Pedido entregue",
    hello: (name) => `Olá ${name},`,
    text1: (orderId) => `Seu pedido nº${orderId} foi entregue.`,
    text2: "Esperamos que você aproveite sua compra.",
    button: "Entrar na minha conta"
  }
};
const refundEmailTexts = {
  fr: {
    subject: "Remboursement confirmé",
    title: "Votre remboursement est confirmé",
    hello: (name) => `Bonjour ${name},`,
    text1: (orderId) => `Votre commande n°${orderId} a été remboursée.`,
    amount: (amount) => `Montant remboursé : ${amount} €`,
    button: "Voir mon compte",
    thanks: "Merci pour votre confiance."
  },

  en: {
    subject: "Refund confirmed",
    title: "Your refund has been processed",
    hello: (name) => `Hello ${name},`,
    text1: (orderId) => `Your order #${orderId} has been refunded.`,
    amount: (amount) => `Refunded amount: ${amount} €`,
    button: "View my account",
    thanks: "Thank you for your trust."
  },

  es: {
    subject: "Reembolso confirmado",
    title: "Tu reembolso ha sido procesado",
    hello: (name) => `Hola ${name},`,
    text1: (orderId) => `Tu pedido n°${orderId} ha sido reembolsado.`,
    amount: (amount) => `Cantidad reembolsada: ${amount} €`,
    button: "Ver mi cuenta",
    thanks: "Gracias por tu confianza."
  },

  pt: {
    subject: "Reembolso confirmado",
    title: "Seu reembolso foi processado",
    hello: (name) => `Olá ${name},`,
    text1: (orderId) => `Seu pedido nº${orderId} foi reembolsado.`,
    amount: (amount) => `Valor reembolsado: ${amount} €`,
    button: "Ver minha conta",
    thanks: "Obrigado pela sua confiança."
  }
};
const orderCreatedEmailTexts = {
  fr: {
    subject: "Confirmation de votre commande",
    title: "Votre commande est confirmée",
    hello: (name) => `Bonjour ${name},`,
    text1: (orderId) => `Votre commande n°${orderId} a bien été enregistrée.`,
    text2: "Nous préparons actuellement votre commande.",
    button: "Voir ma commande",
    thanks: "Merci pour votre achat."
  },

  en: {
    subject: "Order confirmation",
    title: "Your order has been confirmed",
    hello: (name) => `Hello ${name},`,
    text1: (orderId) => `Your order #${orderId} has been successfully created.`,
    text2: "We are currently preparing your order.",
    button: "View my order",
    thanks: "Thank you for your purchase."
  },

  es: {
    subject: "Confirmación de tu pedido",
    title: "Tu pedido ha sido confirmado",
    hello: (name) => `Hola ${name},`,
    text1: (orderId) => `Tu pedido n°${orderId} ha sido registrado.`,
    text2: "Estamos preparando tu pedido.",
    button: "Ver mi pedido",
    thanks: "Gracias por tu compra."
  },

  pt: {
    subject: "Confirmação do pedido",
    title: "Seu pedido foi confirmado",
    hello: (name) => `Olá ${name},`,
    text1: (orderId) => `Seu pedido nº${orderId} foi registrado.`,
    text2: "Estamos preparando seu pedido.",
    button: "Ver meu pedido",
    thanks: "Obrigado pela sua compra."
  }
};
const returnRequestEmailTexts = {
  fr: {
    subject: "Confirmation de votre retour",
    title: "Demande de retour confirmée",
    hello: (name) => `Bonjour ${name},`,
    orderText: (orderId) =>
      `Votre demande de retour pour la commande ${orderId} a bien été enregistrée.`,
    productsTitle: "Produits retournés :",
    reason: "Raison :",
    details: "Détails :",
    labelsTitle: "📦 Étiquette(s) de retour",
    downloadLabel: (index) =>
      `📄 Télécharger l’étiquette ${index ? `#${index}` : ""}`,
    thanks: "Merci pour votre confiance.",
  },

  en: {
    subject: "Return request confirmation",
    title: "Return request confirmed",
    hello: (name) => `Hello ${name},`,
    orderText: (orderId) =>
      `Your return request for order ${orderId} has been successfully registered.`,
    productsTitle: "Returned products:",
    reason: "Reason:",
    details: "Details:",
    labelsTitle: "📦 Return label(s)",
    downloadLabel: (index) =>
      `📄 Download label ${index ? `#${index}` : ""}`,
    thanks: "Thank you for your trust.",
  },

  es: {
    subject: "Confirmación de devolución",
    title: "Solicitud de devolución confirmada",
    hello: (name) => `Hola ${name},`,
    orderText: (orderId) =>
      `Tu solicitud de devolución para el pedido ${orderId} ha sido registrada.`,
    productsTitle: "Productos devueltos:",
    reason: "Motivo:",
    details: "Detalles:",
    labelsTitle: "📦 Etiqueta(s) de devolución",
    downloadLabel: (index) =>
      `📄 Descargar etiqueta ${index ? `#${index}` : ""}`,
    thanks: "Gracias por tu confianza.",
  },

  pt: {
    subject: "Confirmação de devolução",
    title: "Solicitação de devolução confirmada",
    hello: (name) => `Olá ${name},`,
    orderText: (orderId) =>
      `Sua solicitação de devolução para o pedido ${orderId} foi registrada.`,
    productsTitle: "Produtos devolvidos:",
    reason: "Motivo:",
    details: "Detalhes:",
    labelsTitle: "📦 Etiqueta(s) de devolução",
    downloadLabel: (index) =>
      `📄 Baixar etiqueta ${index ? `#${index}` : ""}`,
    thanks: "Obrigado pela sua confiança.",
  },
};
const returnLabelTexts = {
  fr: {
    title: "Étiquette de retour",
    client: "Client",
    address: "Adresse",
    noAddress: "Aucune adresse enregistrée",
    email: "Email",
    order: "Commande",
    product: "Produit",
    returnId: "Retour",
    returnAddress: "Adresse de retour",
    qrText: "Scanner pour suivre le retour",
  },

  en: {
    title: "Return label",
    client: "Customer",
    address: "Address",
    noAddress: "No address registered",
    email: "Email",
    order: "Order",
    product: "Product",
    returnId: "Return",
    returnAddress: "Return address",
    qrText: "Scan to track return",
  },

  es: {
    title: "Etiqueta de devolución",
    client: "Cliente",
    address: "Dirección",
    noAddress: "Ninguna dirección registrada",
    email: "Email",
    order: "Pedido",
    product: "Producto",
    returnId: "Devolución",
    returnAddress: "Dirección de devolución",
    qrText: "Escanear para seguir la devolución",
  },

  pt: {
    title: "Etiqueta de devolução",
    client: "Cliente",
    address: "Endereço",
    noAddress: "Nenhum endereço registrado",
    email: "Email",
    order: "Pedido",
    product: "Produto",
    returnId: "Devolução",
    returnAddress: "Endereço de devolução",
    qrText: "Digitalize para acompanhar a devolução",
  }
};

module.exports = {
  emailTexts,
  resetEmailTexts,
  shippedEmailTexts,
  deliveredEmailTexts,
  refundEmailTexts,
  orderCreatedEmailTexts,
  returnRequestEmailTexts,
  returnLabelTexts
};


//https://ton-backend.onrender.com





