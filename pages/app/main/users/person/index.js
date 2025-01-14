import React, {useEffect, useState} from 'react'
import { MdOutlineModeEditOutline, MdDeleteOutline } from 'react-icons/md'
import {db} from '../../../../../api/firebase'
import { collection, onSnapshot, doc, orderBy, query, deleteDoc } from 'firebase/firestore'
import { locale } from '../../../../../public/locale'

import Zoom from '../../../../components/zoom';

const Person = ({ user, filter, order, users, setUsers, editItem }) => {
  const [person, setPerson] = useState([]);
  const [data, setData] = useState([]);
  const [zoom, setZoom] = useState(false);

  const handleDelete = async (itemId) => {
    try {
      await deleteDoc(doc(db, "users", itemId))
      console.log(`Item deletado do Firestore com ID: ${itemId}`)
    } catch (error) {
      console.error('Erro ao deletar o item: ', error)
    }
  }

  const zoomPhoto = (e) => {
    const item = {
      photoURL: e,
    };
    console.log(item)
    setData(item);
    setZoom(true);
  }

  useEffect(() => {
    const getUsers = onSnapshot(query(collection(db, 'users')), (querySnapshot) => {
      const updateRequest = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        updateRequest.push({ id: doc.id, ...data });
      });
      setUsers(updateRequest);
    });

    const getRequest = onSnapshot(query(collection(db, 'users'), orderBy(order)), (querySnapshot) => {
      const updateRequest = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (filter) {
          if (data.displayName === filter) {
            updateRequest.push({ id: doc.id, ...data })
          }
        } else {
          updateRequest.push({ id: doc.id, ...data });
        }
      });
      setPerson(updateRequest);
    });
  
    return () => {
      getUsers();
      getRequest();
    };
  }, [filter, order]);
  
  return (
    <div className="person-container">
      {zoom && <Zoom data={data} setZoom={setZoom} />}
      <table className="person-table">
        <thead className="person-title">
          <tr>
            <th>{locale.pt.users.inputs.process}</th>
            <th>{locale.pt.users.inputs.img}</th>
            <th>{locale.pt.users.inputs.name}</th>
            <th>{locale.pt.users.inputs.email}</th>
            <th>{locale.pt.users.inputs.group.default}</th>
            <th>{locale.pt.users.inputs.sector.default}</th>
            <th>{locale.pt.users.inputs.type.default}</th>
          </tr>
        </thead>
        <tbody className="person-content">
          {users?.map((item, index) => (
            <tr key={index}>
              <td>{item.process}</td>
              <td><img src={item.photoURL} onClick={() => zoomPhoto(item.photoURL)} width={40} height={40} alt='user image' /></td>
              <td>{item.displayName}</td>
              <td>{item.email}</td>
              <td>{item.group}</td>
              <td>{item.sector}</td>
              <td>{
                item.type=='user'?locale.pt.users.inputs.type.user:
                item.type=='manager'?locale.pt.users.inputs.type.manager:
                item.type=='admin'?locale.pt.users.inputs.type.admin:null
              }</td>
              {user?.type=='admin'?
              <td className='items-buttons'>
                <MdOutlineModeEditOutline className='icon' onClick={() => editItem(item)} />
              </td>:null}
              {user?.type=='admin'?
              <td className='items-buttons'>
                <MdDeleteOutline className='icon' onClick={() => handleDelete(item.id)} />
              </td>:null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Person

