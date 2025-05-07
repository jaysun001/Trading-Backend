function generateInvitationCode(name) {
    if (!name || name.length < 3) {
        throw new Error("Name must be at least 3 characters long")
    }

    // Use the first 3 letters of the username in uppercase
    const namePart = name.substring(0, 3).toUpperCase()

    // Generate 3 random digits
    const digits = Math.floor(100 + Math.random() * 900) // Ensures a 3-digit number

    return `${namePart}${digits}`
}

module.exports = generateInvitationCode
