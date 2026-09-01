import React, {
  useEffect,
  useRef,
} from 'react';

export default function VideoPlayer({
  name = 'Participant',
  isLocal = false,
  isVideoOff = false,
  isMuted = false,
  stream = null,
  videoRef = null,
}) {
  const internalVideoRef =
    useRef(null);

  const finalVideoRef =
    videoRef || internalVideoRef;


  useEffect(() => {
    if (
      finalVideoRef.current &&
      stream
    ) {
      finalVideoRef.current.srcObject =
        stream;
    }
  }, [
    stream,
    finalVideoRef,
  ]);


  return (
    <div
      style={{
        position:
          'relative',
        background:
          '#161616',
        border:
          '1px solid #292929',
        borderRadius:
          '12px',
        overflow:
          'hidden',
        minHeight:
          '220px',
        aspectRatio:
          '16 / 9',
      }}
    >

      {!isVideoOff &&
      stream ? (
        <video
          ref={
            finalVideoRef
          }
          autoPlay
          playsInline
          muted={
            isLocal ||
            isMuted
          }
          style={{
            width:
              '100%',
            height:
              '100%',
            objectFit:
              'cover',
            display:
              'block',
            background:
              '#000',
          }}
        />
      ) : (
        <div
          style={{
            width:
              '100%',
            height:
              '100%',
            minHeight:
              '220px',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            background:
              '#1a1a1a',
          }}
        >
          <div
            style={{
              width:
                '70px',
              height:
                '70px',
              borderRadius:
                '50%',
              background:
                '#ff6600',
              color:
                '#000',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              fontSize:
                '28px',
              fontWeight:
                '800',
            }}
          >
            {name
              .charAt(0)
              .toUpperCase()}
          </div>
        </div>
      )}


      <div
        style={{
          position:
            'absolute',
          left: '10px',
          bottom: '10px',
          right: '10px',
          display:
            'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          background:
            'rgba(0,0,0,.65)',
          padding:
            '7px 10px',
          borderRadius:
            '7px',
          color: '#fff',
          fontSize:
            '12px',
          fontWeight:
            '600',
        }}
      >

        <span>
          {name}
        </span>

        {isMuted && (
          <span>
            🔇
          </span>
        )}

      </div>

    </div>
  );
}