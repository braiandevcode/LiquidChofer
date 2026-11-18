// ERROR TIPADO QUE AVISA QUE FALTA VERIFICAR EL CORREO
export class EmailNotVerifiedError extends Error {
  readonly email: string

  constructor(email: string) {
    super('Te enviamos un correo de verificación. Revisalo y luego iniciá sesión.')
    this.name = 'EmailNotVerifiedError'
    this.email = email
  }
}