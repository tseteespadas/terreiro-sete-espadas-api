function notificationMaker({ GiraNotificationModel, GiraModel, sendMail }) {
  return Object.freeze({
    notificationSender: async () => {
      try {
        const proximaPromise = GiraModel.find({
          startAt: {
            $gte: new Date(),
          },
          // registrationStartAt: {
          //   $lte: new Date(),
          // },
        })
          .sort({ startAt: 1 })
          .limit(1);
        const subscribersPromise = GiraNotificationModel.find({});
        const [proxima, subscribers] = await Promise.all([
          proximaPromise,
          subscribersPromise,
        ]);
        if (proxima.length === 0) {
          console.log(
            "Não há previsão de novas giras abertas. Encerrando o notificador."
          );
          return;
        }
        console.log(proxima[0]);
        console.log(
          `A próxima gira será em ${proxima[0].startAt}. Notificando ${subscribers.length} pessoa(s)`
        );
        const { startAt, name: gira } = proxima[0];
        const dia = new Date(startAt)
          .toJSON()
          .split("T")[0]
          .split("-")
          .reverse()
          .join("/");
        const sent = [];
        const failed = [];
        for (const subscriber of subscribers) {
          const { name, _id, email } = subscriber;
          try {
            await sendMail(
              email,
              "Terreiro Sete Espadas - Lembrete de Gira",
              "notification",
              {
                id: _id,
                nome: name,
                gira,
                dia,
              },
              []
            );
            sent.push({
              email,
              nome: name,
              gira,
              dia,
            });
          } catch (e) {
            console.log(e);
            failed.push({
              email,
              nome,
              gira,
              dia,
            });
          }
        }
        return Object.freeze({
          sent,
          failed,
        });
      } catch (e) {
        console.log(e);
        return null;
      }
    },
  });
}

module.exports = Object.freeze({
  notificationMaker,
});
