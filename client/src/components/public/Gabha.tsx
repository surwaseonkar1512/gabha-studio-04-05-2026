import React from 'react'

type Props = {}

const Gabha = (props: Props) => {
    const images = [
        '/g.png',
        '/a.png',
        '/b.png',
        '/h.png',
        '/a2.png',
    ]

    return (
        <div className="py-4  relative z-10">
            <div className="max-w-[1200px] mx-auto flex flex-nowrap items-center justify-center gap-1 sm:gap-2 px-4">

                {images.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`letter-${index}`}
                        className="h-[50px] sm:h-[90px] md:h-[120px] lg:h-[260px] w-auto object-contain shrink"
                    />
                ))}

            </div>
        </div>
    )
}

export default Gabha