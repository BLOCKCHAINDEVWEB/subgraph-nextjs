import React, { useState, useEffect } from 'react'
import styles from '../styles/Home.module.css'
import Head from 'next/head'
import { withUrqlClient } from 'next-urql'
import { useQuery } from 'urql'

const APIURL = process.env.NEXT_PUBLIC_TEMPORARY_QUERY_URL

const tokensQuery = `
  query {
    tokens(
      orderDirection: desc
      orderBy: createdAtTimestamp
      first: 10
    ) {
      id
      tokenID
      contentURI
      metadataURI
    }
  }
`

export function Home() {
  const [result] = useQuery({
    query: tokensQuery
  })

  const [tokensData, setTokensData] = useState([])

  useEffect(async () => {
    if (!result?.data?.tokens) return

    const promises = await Promise.all(result?.data?.tokens?.map(async token => {
      for await (const tokenId of tokensData) {
        if (tokenId.id === token.id) return
      }

      return token
    }))

    for (const token of promises) {
      if(!token?.contentURI) return
      const newContentURI = await fetch(`https://ipfs.io/ipfs/${token.contentURI.split('/').pop()}`)
      const newMetadataURI = await fetch(`https://ipfs.io/ipfs/${token.metadataURI.split('/').pop()}`)
      const fetchMetadataURI = await(await fetch(newMetadataURI.url)).json()

      const newToken = { ...token, contentURI: newContentURI.url, metadataURI: fetchMetadataURI }

      setTokensData(state => [...state, newToken])
    }

  }, [result])

console.log(tokensData);

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-3 gap-4 px-10 py-10">
        {tokensData.map(token => {
          return (
            <div key={token.id} className="shadow-lg bg-transparent rounded-2xl overflow-hidden">
              <div className="w-100% h-100%">
                {token?.metadataURI?.mimeType === 'image' &&
                  <div style={{height: '320px', overflow: 'hidden'}}>
                    <img className="object-contain" style={{ minHeight: '320px' }} src={token.contentURI} />
                  </div>
                }
                {token?.metadataURI?.body?.mimeType === 'audio/wav' &&
                  <figure>
                    <figcaption>Listen "{token.metadataURI.body.title}" by {token.metadataURI.body.artist}</figcaption>
                      <audio controls>
                        <source src={token.contentURI} type="audio/ogg" />
                        <source src={token.contentURI} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                  </figure>
                }
                {token?.metadataURI?.mimeType === 'video/mp4' && (
                  <div className="relative">
                    <div style={{width: '288px', height: '320px', boxSizing: 'border-box'}} />
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                      <video height="auto" controls autoPlay
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover'
                      }}>
                        <source src={token.contentURI} />
                      </video>
                    </div>
                  </div>
                )}
                {token?.metadataURI?.mimeType === 'text/plain' && (
                  <div className="px-2 pt-2 pb-10">
                    <h3 style={{ height: 100 }} className="text-2xl p-4 pt-6 font-semibold">
                      {token.metadataURI.name}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default withUrqlClient((_ssrExchange, ctx) => ({
  url: APIURL
}))(Home)
