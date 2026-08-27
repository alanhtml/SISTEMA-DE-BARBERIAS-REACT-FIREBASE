import { useState, useEffect } from 'react';
import firebase, { firestore, storageRef, auth } from '../firebase/config';
import { Store } from '../models/Store';

export const useBarberController = () => {
  const [db, setDb] = useState({
    users: [], clients: [], services: [], products: [],
    cuts: [], sales: [], turns: [], expenses: [], settings: {}, currentTurn: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('barber_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const collections = ['users', 'clients', 'services', 'products', 'cuts', 'sales', 'turns', 'expenses'];
    const unsubscribers = [];

    const promises = collections.map(colName => {
      return new Promise(resolve => {
        const unsub = firestore.collection(colName).onSnapshot(snapshot => {
          const data = snapshot.docs.map(doc => {
            const item = doc.data();
            const normalizedItem = { ...item };

            // 1. Normalización de Fechas (Timestamps o Strings extraños)
            Object.keys(normalizedItem).forEach(key => {
              const val = normalizedItem[key];
              if (val && typeof val.toDate === 'function') {
                normalizedItem[key] = val.toDate().toISOString();
              } else if (typeof val === 'string' && val.includes(' de ')) {
                // Normalizar formato de fecha en español (Android): "14 de agosto de 2024..."
                try {
                  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                  const parts = val.toLowerCase().split(' ');
                  const day = parseInt(parts[0]);
                  const month = months.indexOf(parts[2]);
                  const year = parseInt(parts[4]);
                  const time = parts[7].split(':');
                  let hour = parseInt(time[0]);
                  const min = parseInt(time[1]);
                  const sec = parseInt(time[2]);
                  if (parts[8] === 'p.m.' && hour < 12) hour += 12;
                  if (parts[8] === 'a.m.' && hour === 12) hour = 0;
                  const dateObj = new Date(year, month, day, hour, min, sec);
                  if (!isNaN(dateObj)) normalizedItem[key] = dateObj.toISOString();
                } catch (e) {
                  console.error("Error parsing date:", val);
                }
              }
            });

            // 2. Normalización de IDs Numéricos y Precios
            const numericFields = ['barberId', 'serviceId', 'price', 'total', 'amount', 'stock', 'costPrice', 'quantity', 'totalCuts', 'cutsForFree'];
            numericFields.forEach(field => {
              if (normalizedItem[field] !== undefined && normalizedItem[field] !== null) {
                // Si es un string que contiene un número, convertirlo
                if (typeof normalizedItem[field] === 'string' && normalizedItem[field].trim() !== '' && !isNaN(normalizedItem[field])) {
                  normalizedItem[field] = Number(normalizedItem[field]);
                }
              }
            });

            // 3. Soporte para campos duplicados de la App Android (idBarbero -> barberId)
            if (normalizedItem.idBarbero && !normalizedItem.barberId) {
              normalizedItem.barberId = Number(normalizedItem.idBarbero) || normalizedItem.idBarbero;
            }
            // Asegurar que barberId sea consistente si existe
            if (normalizedItem.barberId !== undefined) {
              normalizedItem.barberId = isNaN(normalizedItem.barberId) ? normalizedItem.barberId : Number(normalizedItem.barberId);
            }

            return {
              ...normalizedItem,
              id: isNaN(doc.id) ? doc.id : parseInt(doc.id)
            };
          });
          setDb(prev => ({ ...prev, [colName]: data }));
          resolve();
        });
        unsubscribers.push(unsub);
      });
    });

    const unsubMeta = firestore.collection('metadata').doc('global').onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        setDb(prev => ({
          ...prev,
          settings: {
            ...(data.settings || {}),
            blacklist: data.blacklist || []
          },
          currentTurn: data.currentTurn !== undefined ? data.currentTurn : prev.currentTurn
        }));
      } else {
        const initialMeta = { settings: Store.getInitialData()?.settings || {}, currentTurn: 0, blacklist: [] };
        firestore.collection('metadata').doc('global').set(initialMeta);
      }
    });
    unsubscribers.push(unsubMeta);

    Promise.all(promises).then(() => setIsLoading(false));

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper para normalización estricta de datos antes de escribir en Firestore
  const normalizeForFirestore = (data) => {
    const normalized = { ...data };
    const numericFields = ['barberId', 'serviceId', 'price', 'total', 'amount', 'stock', 'costPrice', 'quantity', 'totalCuts', 'cutsForFree', 'id'];

    Object.keys(normalized).forEach(key => {
      if (numericFields.includes(key) && normalized[key] !== undefined && normalized[key] !== null) {
        normalized[key] = Number(normalized[key]);
      }
      // Asegurar que no haya undefined en Firestore
      if (normalized[key] === undefined) {
        delete normalized[key];
      }
    });
    return normalized;
  };

  const updateDB = async (key, value) => {
    try {
      if (Array.isArray(value)) {
        for (const item of value) {
          const id = String(item.id || Date.now());
          await firestore.collection(key).doc(id).set(normalizeForFirestore(item));
        }
      } else {
        await firestore.collection('metadata').doc('global').update({ [key]: value });
      }
    } catch (err) {
      console.error("Error al actualizar Firestore:", err);
    }
  };

  const addTurn = async (clientId, serviceId, guestData = null) => {
    const phoneToCheck = guestData?.phone || '';
    const isBlacklisted = db.settings?.blacklist?.includes(phoneToCheck);

    if (isBlacklisted && phoneToCheck !== '') {
      notify('ACCESO DENEGADO: Número restringido.', 'error');
      return false;
    }

    const service = db.services.find(s => s.id == serviceId);
    const newNumber = (db.currentTurn || 0) + 1;
    const turnId = String(Date.now());

    let clientName = guestData?.name || 'Visitante';
    let clientPhone = guestData?.phone || '';
    let clientUsername = guestData?.username || '';

    if (clientId && clientId !== 'guest') {
      const client = db.clients.find(c => String(c.id) === String(clientId));
      if (client) {
        clientName = client.name;
        clientPhone = client.phone || '';
        clientUsername = client.username || '';
      }
    }

    const newTurn = normalizeForFirestore({
      id: turnId,
      number: newNumber,
      clientName, clientPhone, clientUsername,
      serviceName: service ? service.name : 'Servicio',
      clientId: clientId || 'guest',
      serviceId,
      status: 'esperando',
      arrivalTime: new Date().toISOString()
    });

    await firestore.collection('turns').doc(turnId).set(newTurn);
    await firestore.collection('metadata').doc('global').update({ currentTurn: newNumber });
    notify('Turno asignado: #' + newNumber);
    return true;
  };

  const completeTurn = async (turnId) => {
    const turn = db.turns.find(t => String(t.id) === String(turnId));
    if (!turn) return;
    const service = db.services.find(s => String(s.id) === String(turn.serviceId));
    const client = db.clients.find(c => String(c.id) === String(turn.clientId));

    // Identificar al barbero: del turno o del usuario actual
    const barberId = turn.barberId || (user?.role === 'barbero' ? user.id : null);
    const barber = db.users.find(u => String(u.id) === String(barberId));

    if (!service) return notify('Error: Datos del servicio no encontrados', 'error');

    const isFree = (client?.cutsForFree || 0) >= (db.settings?.fidelity?.requiredCuts || 5);
    const timestamp = Date.now();
    const cutId = String(timestamp);

    const cutData = normalizeForFirestore({
      id: timestamp,
      barberId: barberId ? Number(barberId) : 0,
      barberName: barber ? barber.name : (turn.barberName || 'Barbero Staff'),
      clientId: turn.clientId || 'visitor',
      clientName: client ? client.name : (turn.clientName || 'Visitante'),
      serviceId: Number(turn.serviceId),
      serviceName: service.name,
      price: isFree ? 0 : Number(service.price || 0),
      isFree,
      date: new Date().toISOString()
    });

    await firestore.collection('cuts').doc(cutId).set(cutData);

    if (client) {
      const updatedCutsForFree = isFree ? 0 : (Number(client.cutsForFree) || 0) + 1;
      await firestore.collection('clients').doc(String(client.id)).update({
        totalCuts: (Number(client.totalCuts) || 0) + 1,
        cutsForFree: updatedCutsForFree
      });
    }
    await firestore.collection('turns').doc(String(turnId)).delete();
    notify('Servicio completado');
  };

  const recordCut = async (data) => {
    try {
      const barber = db.users.find(u => String(u.id) === String(data.barberId));
      const service = db.services.find(s => String(s.id) === String(data.serviceId));
      let client = null;
      let clientName = 'Visitante';

      if (data.clientId && data.clientId !== 'visitor') {
        client = db.clients.find(c => String(c.id) === String(data.clientId));
        if (client) clientName = client.name;
      }

      const isFree = (client?.cutsForFree || 0) >= (db.settings?.fidelity?.requiredCuts || 5);
      const timestamp = Date.now();
      const cutId = String(timestamp);

      const cutData = normalizeForFirestore({
        id: timestamp,
        barberId: Number(data.barberId),
        barberName: barber ? barber.name : 'Barbero',
        clientId: data.clientId || 'visitor',
        clientName: clientName,
        serviceId: Number(data.serviceId),
        serviceName: service ? service.name : 'Servicio',
        price: isFree ? 0 : Number(service?.price || 0),
        isFree,
        date: data.date || new Date().toISOString()
      });

      await firestore.collection('cuts').doc(cutId).set(cutData);

      if (client) {
        const updatedCutsForFree = isFree ? 0 : (Number(client.cutsForFree) || 0) + 1;
        await firestore.collection('clients').doc(String(client.id)).update({
          totalCuts: (Number(client.totalCuts) || 0) + 1,
          cutsForFree: updatedCutsForFree
        });
      }
      return true;
    } catch (error) {
      console.error("Error recordCut:", error);
      return false;
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      const normalized = normalizeForFirestore(clientData);
      await firestore.collection('clients').doc(String(id)).update(normalized);

      // Solo actualizar la colección de usuarios si se proporcionaron campos relevantes
      if (normalized.name || normalized.ci) {
        const userExists = db.users.find(u => String(u.id) === String(id));
        if (userExists) {
          const userUpdate = {};
          if (normalized.name) userUpdate.name = normalized.name;
          if (normalized.ci) userUpdate.ci = normalized.ci;
          await firestore.collection('users').doc(String(id)).update(userUpdate);
        }
      }

      notify('Perfil actualizado');
      return true;
    } catch (error) {
      console.error("Error updating client:", error);
      notify('Error al actualizar', 'error');
      return false;
    }
  };

  const loginWithGoogle = async () => {
    notify('Conectando con Google...', 'info');
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const googleUser = result.user;
      const email = googleUser.email.toLowerCase();

      const userSnapshot = await firestore.collection('users').where('username', '==', email).limit(1).get();
      let localUser;

      if (!userSnapshot.empty) {
        localUser = userSnapshot.docs[0].data();
      } else {
        localUser = {
          id: Date.now(),
          name: googleUser.displayName || 'Cliente Google',
          username: email,
          role: 'cliente',
          photoURL: googleUser.photoURL,
          ci: 'GOOGLE_USER',
          phone: googleUser.phoneNumber || ''
        };
      }

      if (localUser.role === 'cliente' && !localUser.phone) {
        return { ...localUser, needsPhone: true };
      }

      if (userSnapshot.empty) {
        const normalizedLocalUser = normalizeForFirestore(localUser);
        await firestore.collection('users').doc(String(localUser.id)).set(normalizedLocalUser);
        await firestore.collection('clients').doc(String(localUser.id)).set({
          ...normalizedLocalUser, totalCuts: 0, cutsForFree: 0
        });
      }

      setUser(localUser);
      localStorage.setItem('barber_user', JSON.stringify(localUser));
      notify('Bienvenido ' + localUser.name);
      return true;
    } catch (error) {
      notify('Error de autenticación', 'error');
      return false;
    }
  };

  const finalizeGoogleLogin = async (userData, phone) => {
    try {
      const fullUser = normalizeForFirestore({ ...userData, phone });
      await firestore.collection('users').doc(String(fullUser.id)).set(fullUser);
      await firestore.collection('clients').doc(String(fullUser.id)).set({
        ...fullUser, totalCuts: 0, cutsForFree: 0
      });
      setUser(fullUser);
      localStorage.setItem('barber_user', JSON.stringify(fullUser));
      notify('Registro completado');
      return true;
    } catch (error) {
      notify('Error al finalizar registro', 'error');
      return false;
    }
  };

  return {
    db, user, setUser, view, setView, isLoading, notification,
    login: async (u, p) => {
      const userClean = u.trim();
      const passClean = p.trim();
      let f = db.users.find(x => x.username === userClean && x.password === passClean);
      if (f) {
        setUser(f);
        localStorage.setItem('barber_user', JSON.stringify(f));
        notify('Bienvenido ' + f.name);
        return true;
      }
      notify('Credenciales incorrectas', 'error');
      return false;
    },
    logout: () => {
      auth.signOut();
      setUser(null);
      localStorage.removeItem('barber_user');
      setView('dashboard');
    },
    loginWithGoogle,
    finalizeGoogleLogin,
    updateDB, notify, addTurn, completeTurn, recordCut, updateClient,
    cancelTurn: async (id) => {
      await firestore.collection('turns').doc(String(id)).delete();
      notify('Turno cancelado', 'error');
    },
    addClient: async (data) => {
      const timestamp = Date.now();
      const id = String(timestamp);
      const normalizedData = normalizeForFirestore({ ...data, id: timestamp, totalCuts: 0, cutsForFree: 0 });
      await firestore.collection('clients').doc(id).set(normalizedData);
      notify('Cliente agregado');
    },
    addService: async (data) => {
      const timestamp = Date.now();
      const id = String(timestamp);
      const normalizedData = normalizeForFirestore({ ...data, id: timestamp });
      await firestore.collection('services').doc(id).set(normalizedData);
      notify('Servicio creado');
    },
    deleteService: async (id) => {
      await firestore.collection('services').doc(String(id)).delete();
      notify('Servicio eliminado', 'error');
    },
    addExpense: async (data) => {
      const timestamp = Date.now();
      const id = String(timestamp);
      const normalizedData = normalizeForFirestore({ ...data, id: timestamp, date: new Date().toISOString() });
      await firestore.collection('expenses').doc(id).set(normalizedData);
      notify('Gasto registrado');
    },
    deleteExpense: async (id) => {
      await firestore.collection('expenses').doc(String(id)).delete();
      notify('Gasto eliminado', 'error');
    },
    resetSystem: async () => {
      try {
        const collections = ['cuts', 'sales', 'turns', 'expenses'];
        for (const colName of collections) {
          const snapshot = await firestore.collection(colName).get();
          const batch = firestore.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
        await firestore.collection('metadata').doc('global').update({ currentTurn: 0 });
        notify('Sistema reiniciado correctamente');
        return true;
      } catch (error) {
        notify('Error al reiniciar sistema', 'error');
        return false;
      }
    },
    repairDatabase: async () => {
      notify('Iniciando reparación de base de datos...', 'info');
      try {
        const collections = ['cuts', 'clients', 'services', 'users', 'expenses', 'sales'];
        for (const colName of collections) {
          const snapshot = await firestore.collection(colName).get();
          const batch = firestore.batch();
          let count = 0;

          snapshot.docs.forEach(doc => {
            const data = doc.data();
            let changed = false;
            const newData = { ...data };

            // Campos numéricos que deben ser int64/Number
            const numericFields = ['barberId', 'serviceId', 'price', 'id', 'totalCuts', 'cutsForFree', 'amount', 'total', 'costPrice', 'quantity', 'stock'];
            numericFields.forEach(field => {
              if (newData[field] !== undefined && typeof newData[field] === 'string' && !isNaN(newData[field]) && newData[field] !== '') {
                newData[field] = Number(newData[field]);
                changed = true;
              }
            });

            // Normalizar fechas a ISO String
            const dateFields = ['date', 'arrivalTime', 'scheduledTime'];
            dateFields.forEach(field => {
              if (newData[field] && typeof newData[field].toDate === 'function') {
                newData[field] = newData[field].toDate().toISOString();
                changed = true;
              }
            });

            if (changed) {
              batch.set(doc.ref, newData, { merge: true });
              count++;
            }
          });

          if (count > 0) {
            await batch.commit();
          }
        }
        notify('Base de datos normalizada con éxito');
        return true;
      } catch (error) {
        console.error("Error en reparación:", error);
        notify('Error durante la reparación', 'error');
        return false;
      }
    }
  };
};
