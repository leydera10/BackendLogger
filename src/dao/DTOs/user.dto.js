class UserDTO {
    constructor(user) {
        this.nombre = user.nombre || '';
        this.apellido = user.apellido || '';
        this.email = user.email || '';
        this.password = user.password || '';
        this.isGithubAuth = user.isGithubAuth || false;
        this.cartId = user.cartId || null;
        this.rol = user.rol || 'user';
    }
}

module.exports = UserDTO;