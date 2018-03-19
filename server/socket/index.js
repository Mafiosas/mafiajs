module.exports = io => {
  io.on("connection", socket => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    let game;

    socket.on("joinGame", gameName => {
      game = gameName;
      socket.join(game);
    });

    socket.on("disconnect", () => {
      console.log(`Connection ${socket.id} is no longer connected!`);
    });

    socket.on("gameStart", () => {
      socket.broadcast.to(game).emit("dark", () => {
        setTimeout(() => {
          socket.broadcast.to(game).emit("darkOver");
        }, 60000);
      });
    });

    socket.on("darkData", darkData => {
      //do the things with the data
      //check is the game still going?
      //if yes then...
      socket.broadcast.to(game).emit("daytime", dataFromDark);
      //if no then..
      socket.broadcast.to(game).emit("gameOver");
    });

    socket.on("startDayTimerPreVotes", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("getVotes");
      }, 300000);
    });

    socket.on("startDayTimerPostVotes", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("dark");
      }, 300000);
    });

    socket.on("voteData", voteData => {
      //do the things with the vote data
      //check is the game still going?
      //if yes then...
      socket.broadcast.to(game).emit("dayVoteResults", dayVoteResults);
      //if no then..
      socket.broadcast.to(game).emit("gameOver");
    });

    socket.on("startDarkTimer", () => {
      setTimeout(() => {
        socket.broadcast.to(game).emit("darkOver");
      }, 6000);
    });
  });
};
