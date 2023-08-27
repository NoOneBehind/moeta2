'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { SERVER_URL } from '../../../client/src/const';

const timeout = 2000;

export default function Home() {
  const [socket, setSocket] = useState<ReturnType<typeof io>>();

  useEffect(() => {
    if (socket) {
      return;
    }

    const socketInstance = io(SERVER_URL);
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!socket) {
    return <div>loading...</div>;
  }

  socket.on('message', (idx) => {
    console.log(idx);
    const box = document.getElementById(`flower${idx}`);
    if (box) {
      box.style.backgroundColor = 'red';
      setTimeout(() => {
        box.style.backgroundColor = 'transparent';
      }, 2000);
    }
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        width: '80vw',
        height: '40vw',
        gap: '2vw',
        margin: '0 auto',
      }}
    >
      {Array(8)
        .fill(null)
        .map((_, idx) => (
          <div
            id={`flower${idx}`}
            key={+idx}
            style={{ border: 'solid 1px' }}
            onClick={() => {
              socket.timeout(timeout).emitWithAck('message', idx);
            }}
          >
            {idx}
          </div>
        ))}
    </div>
  );
}
