import { PropsWithChildren, createContext, useState } from "react";

type PlayerContext = {
  player: any;
  createPlayer: (player: any) => void;
};

export const PlayerContext = createContext<PlayerContext>({} as PlayerContext);

export const PlayerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [player, setPlayer] = useState();
  return (
    <PlayerContext.Provider value={{ player, createPlayer: setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};
