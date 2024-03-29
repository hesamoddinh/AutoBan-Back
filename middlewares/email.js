const nodemailer = require("nodemailer");
const emailConfig = rootRequire("config/email");
const Log = rootRequire("middlewares/log");
const Email = require("email-templates");

module.exports.sendMail = async function(emailTo, template, locals) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailConfig.emailUsername,
      pass: emailConfig.emailPassword
    }
  });

  const email = new Email({
    message: {
      from: emailConfig.emailUsername
    },
    // send: true,
    // preview: false,
    transport: transporter
  });
  info = await email.send({
    template: template,
    message: { to: emailTo },
    locals: locals
  });
  Log(null, "Email sent to " + emailTo, "SYSTEM");

  return info;
};
