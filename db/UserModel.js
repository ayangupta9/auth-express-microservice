class User {
  constructor (username, email, password) {
    this._username = username
    this._email = email
    this._password = password
  }

  get username () {
    return this._username
  }

  get email () {
    return this._email
  }

  get password () {
    return this._password
  }
}
