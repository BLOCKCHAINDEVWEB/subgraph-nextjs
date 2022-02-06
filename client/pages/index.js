import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { createClient } from 'urql'
import axios from 'axios'
import CID from 'cids'


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

export default function Home({ data }) {
  const [tokensData, setTokensData] = useState([])

  useEffect(async () => {
    if (!data?.tokens) return

    const tokenCID = tokenIpfsLink => {
      let tokenIpfsCID = tokenIpfsLink?.split('/').pop()
      if (tokenIpfsLink?.lenght === 46 && tokenIpfsCID?.substring(0, 2) === 'Qm') {
        tokenIpfsCID = new CID(tokenIpfsLink).toV1().toString('base32')
      }

      return tokenIpfsCID
    }

    const ipfsGet = async tokenIpfsLink => {
      let tokenIpfsCID = tokenCID(tokenIpfsLink)

      let result
      try {
        result = await axios.get(`https://${tokenIpfsCID}.ipfs.infura-ipfs.io`)
      } catch (err) {
        console.log(err)
      }

      return result
    }

    for (const token of data?.tokens) {
      if(!token?.contentURI) return

      let isTokenExist

      tokensData.map(async item => {
        if (item?.id === token?.id) isTokenExist = true
      })

      if (isTokenExist) return

      const newContentURI = `https://${tokenCID(token?.contentURI)}.ipfs.infura-ipfs.io`
      const newMetadataURI = await ipfsGet(token?.metadataURI)

      const newToken = { ...token, contentURI: newContentURI, metadataURI: newMetadataURI }

      setTokensData(state => [...state, newToken])
    }
  }, [data])

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid grid-cols-3 gap-4 px-10 py-10">
        {tokensData?.map(token => {
          return (
            <div key={token?.id} className="shadow-lg bg-transparent rounded-2xl overflow-hidden">
              <div className="w-100% h-100%">
                {token?.metadataURI?.data?.mimeType === 'image/jpeg'
                && <div style={{height: '320px', overflow: 'hidden'}}>
                    <img className="object-contain" style={{ minHeight: '320px' }} src={token?.contentURI} />
                  </div>
                }
                {token?.metadataURI?.data?.mimeType === 'audio/wav'
                || token?.metadataURI?.data?.mimeType === 'audio/x-wav'
                && <figure>
                    <figcaption>Listen "{token?.metadataURI?.data?.name}" by {token.metadataURI?.data?.artist}</figcaption>
                      <audio controls>
                        <source src={token?.contentURI} type="audio/ogg" />
                        <source src={token?.contentURI} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                  </figure>
                }
                {/* TODO: repair the video player */}
                {token?.metadataURI?.data?.mimeType === 'video/mp4'
                && (
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
                        <source src={token?.contentURI} />
                      </video>
                    </div>
                  </div>
                )}
                {token?.metadataURI?.data?.mimeType === 'text/plain'
                && (
                  <div className="px-2 pt-2 pb-10">
                    <h3 style={{ height: 100 }} className="text-2xl p-4 pt-6 font-semibold">
                      {token?.metadataURI?.data?.name}
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

export const getServerSideProps = async context => {
  const API_URL = process.env.NEXT_PUBLIC_TEMPORARY_QUERY_URL

  const client = createClient({
    url: API_URL,
  })

  const { data } = await client.query(tokensQuery).toPromise()

  return {
    props: {
      data: data
    }
  }
}