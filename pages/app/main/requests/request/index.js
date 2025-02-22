import React, {useEffect, useState} from 'react'
import { MdDoneAll } from 'react-icons/md'
import {db} from '../../../../../api/firebase'
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import { locale } from '../../../../../public/locale'

import Alert from '../../../../components/alert'
import Zoom from '../../../../components/zoom';

const Request = ({ user, users, filter, order, setItem, setUsers }) => {
  const [request, setRequest] = useState([])
  const [alert, setAlert] = useState(false)
  const [data, setData] = useState(null)
  const [dataZoom, setDataZoom] = useState([]);
  const [zoom, setZoom] = useState(false);

  const handleRes = (requestId, itemID, itemName) => {
    const itemTotal = `Codigo: ${itemID} | Nome: ${itemName}`
    const item = {
      title: 'Tens a certeza?',
      text: 'Tens a certeza, que o utilizador:',
      list_text: 'Está a devolver:',
      item: [itemTotal],
      name: user?.displayName,
      button: () => handleConfirm(requestId)
    }
    setData(item)
    setAlert(true)
  }

  const handleConfirm = async (requestId) => {
    setAlert(false)
    const timestamp = new Date()
    try {
      const itemRef = doc(db, 'requests', requestId)
      const updatedData = {
        resAt: timestamp,
        updateAt: timestamp
      };
  
      await updateDoc(itemRef, updatedData); 
      console.log(`Item com ID ${requestId} foi editado com sucesso.`)
    } catch (error) {
      console.error(`Erro ao editar o item com ID ${requestId}:`, error)
    }
  }

  const zoomPhoto = (e) => {
    const item = {
      photoURL: e,
    };
    console.log(item)
    setDataZoom(item);
    setZoom(true);
  }

  useEffect(() => {
    const getItem = onSnapshot(query(collection(db, 'items'), orderBy('code')), (querySnapshot) => {
      const updateRequest = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        updateRequest.push({ id: doc.id, ...data })
      })
      setItem(updateRequest);
    })

    const getUsers = onSnapshot(query(collection(db, 'users')), (querySnapshot) => {
      const updateRequest = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        updateRequest.push({ id: doc.id, ...data })
      })
      setUsers(updateRequest)
    })

    const getRequest = onSnapshot(query(collection(db, 'requests'), /*orderBy(order)*/), (querySnapshot) => {
      const updateRequest = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        /*if (filter) {
          if (data.user.displayName === filter) {
            updateRequest.push({ id: doc.id, ...data })
          }
        } else {
          updateRequest.push({ id: doc.id, ...data })
        }*/
        updateRequest.push({ id: doc.id, ...data })
      })
      setRequest(updateRequest)
    })
  
    return () => {
      getItem()
      getUsers()
      getRequest()
    };
  }, [filter, order])
  
  return (
    <div className="request-container">
      {alert && <Alert data={data} setAlert={setAlert} />}
      {zoom && <Zoom data={dataZoom} setZoom={setZoom} />}
      <table className="request-table">
        <thead className="request-title">
          <tr>
            <th>{locale.pt.requests.request.code}</th>
            <th>{locale.pt.requests.request.item}</th>
            <th>{locale.pt.requests.request.requester}</th>
            <th>{locale.pt.requests.request.foto}</th>        
            <th>{locale.pt.requests.request.reqAt}</th>        
          </tr>
        </thead>
        <tbody className="request-content">
          {request?.map((item, index) => (
            item.resAt === null?
              <tr key={index}>
                <td>{item.item.code}</td>
                <td><img src={item.item.img} onClick={() => zoomPhoto(item.item.img)} width={40} height={40} alt='item image' /></td>
                <td>{item.user.displayName}</td>
                <td><img src={item.user.photoURL} onClick={() => zoomPhoto(item.user.photoURL)} width={40} height={40} alt='user photo' /></td>
                <td>{item.reqAt.toDate().toLocaleString()}</td>
                {user?.type=='admin'||user?.type=='manager'?
                <td className='request-buttons'>
                  <MdDoneAll className='icon' onClick={() => handleRes(item.id, item.item.code, item.item.name)} />
                </td>:null}
              </tr>
            :null
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Request

