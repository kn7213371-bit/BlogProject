export function checkAuth(req, res, next) {
  console.log("Session ID:", req.sessionID);
  console.log("Session data:", req.session);
  console.log("User:", req.session?.user);
  if (!req.session?.user?.id) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  next();
}