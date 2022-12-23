const transporter = require("../services/mailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

async function sendEmail(to, subject, templateName, context, attachments) {
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./src/views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/views/"),
  };
  transporter.use("compile", hbs(handlebarOptions));

  const info = await transporter.sendMail({
    from: '"Comunidade Onirê" <comunidadeonire@gmail.com>',
    to,
    subject,
    template: templateName,
    context,
    attachments,
  });
  console.log({ message: "Mail sended successfuly", info });
}

module.exports = sendEmail;
