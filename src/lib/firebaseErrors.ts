// Traduction des codes d'erreur Firebase en français
const firebaseErrorMessages: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
  'auth/invalid-email': 'Adresse email invalide.',
  'auth/operation-not-allowed': 'Opération non autorisée.',
  'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
  'auth/user-disabled': 'Ce compte a été désactivé.',
  'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
  'auth/wrong-password': 'Mot de passe incorrect.',
  'auth/invalid-credential': 'Identifiants invalides.',
  'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
  'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.',

  // Firestore errors
  'permission-denied': "Vous n'avez pas les permissions nécessaires.",
  unavailable: 'Service temporairement indisponible.',
  'not-found': 'Document non trouvé.',
  'already-exists': 'Le document existe déjà.',
};

export function getFirebaseErrorMessage(errorCode: string): string {
  return firebaseErrorMessages[errorCode] || 'Une erreur inattendue est survenue.';
}
