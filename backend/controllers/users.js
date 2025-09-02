// username -> { password, role, tenant }
module.exports = {
  admin: { password: "1234", role: "Admin", tenant: "demoA" },
  alice: { password: "alice123", role: "Viewer", tenant: "demoApi" },
  bob: { password: "bob123", role: "Viewer", tenant: "demoAWS" },
};
