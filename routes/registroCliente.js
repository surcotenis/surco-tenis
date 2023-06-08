const express = require('express');
const router = express.Router();
const dbConnection = require('../core/db_config'); // Importa el módulo para acceder a la base de datos
const moment = require('moment');
const {verifyToken, verifyTokenAndAuthorization} =require("./verifyToken")

router.get('/listar/', async (req, res) => {
  try {
    const connection = await dbConnection(); // Obtén la conexión a la base de datos
    const idFilter = req.query.id;
    let sql = `
      SELECT
        registro.codRegistro,
        registro.fechRegistro,
        registro.horainicio,
        registro.horafinal,
        registro.estado AS estadoRegistro,
        registro.comentario,
        registro.duracion,
        cliente.nombres AS nomCliente,
        registro.codCliente,
        localidad.codLocalidad,
        localidad.nomLocalidad,
        registro.codUsuario
      FROM
        registro
        JOIN cliente ON registro.codCliente = cliente.codCliente
        JOIN localidad ON registro.codLocalidad = localidad.codLocalidad`;

    let params = [];

    if (idFilter) {
      sql += " WHERE registro.codLocalidad = ?";
      params.push(idFilter);
    }

    const [rows] = await connection.query(sql, params); // Ejecuta la consulta utilizando la conexión

    const nueva_agenda = rows.map((value) => ({
      id: value.codRegistro,
      start: `${value.fechRegistro} ${value.horainicio}`,
      end: `${value.fechRegistro} ${value.horafinal}`,
      //title: `${value.estadoRegistro} - ${value.nomCliente}`,
      backgroundColor: value.estadoRegistro === 'SIN CONFIRMAR' ? '#F86569' : '#20c997',
      textColor: '#fff',
      extendedProps: {
        codRegistro: value.codRegistro,
        codCliente: value.codCliente,
        codLocalidad: value.codLocalidad,
        nomLocalidad: value.nomLocalidad,
        comentario: value.comentario,
        duracion: value.duracion,
        pago: value.pago,
        estado: value.estadoRegistro,
      },
    }));

    res.json(nueva_agenda);

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// Ruta para guardar el registro
/*
router.post('/guardar',verifyToken, (req, res) => {
  const input = req.body;
  //db.query(
  //  'SELECT * FROM caja WHERE codLocalidad = ? AND montoCierre IS NULL',
  //  [input.ddlLocalidad],
  //  (error, results) => {
  //    if (error) {
  //      console.error(error);
  //      return res.status(500).json({ error: 'Error en la base de datos' });
  //    }
//
  //    if (results.length === 0) {
  //      return res.status(400).json({ error: 'Caja no encontrada' });
  //    }
//
  //    const caja = results[0];

      if (validarFecha(-1, input.ddlLocalidad, input.txtFecha, input.txtHoraInicial, input.txtHoraFinal)) {
        const registro = {
          codUsuario: 1, // Aquí puedes cambiarlo para obtener el código del usuario autenticado usando JWT
          codCliente: input.ddlClientes,
          codLocalidad: input.ddlLocalidad,
         // codCaja: caja.codCaja,
          fechRegistro: input.txtFecha,
          horainicio: input.txtHoraInicial,
          horafinal: input.txtHoraFinal,
          duracion: input.txtTiempo,
          estado: 'SIN CONFIRMAR',
          costoTarifa:input.costoTarifa,
          comentario: input.txtComentario
        };

        db.query('INSERT INTO registro SET ?', registro, (error, results) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error en la base de datos' });
          }

          return res.json({ ok: true });
        });
      } else {
        return res.json({ ok: false });
      }
    }
  );
//});
*/
/*
router.post('/guardar', verifyToken, async (req, res) => {
  try {
    const connection = await dbConnection(); // Obtén la conexión a la base de datos
    const input = req.body;

    if (validarFecha(-1, input.ddlLocalidad, input.txtFecha, input.txtHoraInicial, input.txtHoraFinal)) {
      const registro = {
        codUsuario: 1, // Aquí puedes cambiarlo para obtener el código del usuario autenticado usando JWT
        codCliente: input.ddlClientes,
        codLocalidad: input.ddlLocalidad,
        // codCaja: caja.codCaja,
        fechRegistro: input.txtFecha,
        horainicio: input.txtHoraInicial,
        horafinal: input.txtHoraFinal,
        duracion: input.txtTiempo,
        estado: 'SIN CONFIRMAR',
        costoTarifa: input.costoTarifa,
        comentario: input.txtComentario
      };

      const [results] = await connection.query('INSERT INTO registro SET ?', registro); // Ejecuta la inserción utilizando la conexión

      res.json({ ok: true });
    } else {
      res.json({ ok: false });
    }

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});
*/
router.post('/guardar', verifyToken, async (req, res) => {
  try {
    const connection = await dbConnection(); // Obtén la conexión a la base de datos
    const input = req.body;

    if (validarFecha(-1, input.ddlLocalidad, input.txtFecha, input.txtHoraInicial, input.txtHoraFinal)) {
      // Verificar si hay una campaña que comienza en la misma hora
      const [existingCampaigns] = await connection.query(
        'SELECT * FROM registro WHERE horainicio = ? AND codLocalidad = ? AND fechRegistro = ?',
        [input.txtHoraInicial, input.ddlLocalidad, input.txtFecha ]
      );

      if (existingCampaigns.length > 0) {
        // Si hay una campaña que comienza en la misma hora y localidad, devolver una respuesta indicando que no se puede registrar la reserva
        res.json({ ok: false, message: 'Ya hay una campaña que comienza en la misma hora y localidad.' });
      } else {
        // Si no hay campañas que cumplan con los criterios, insertar la reserva
        const registro = {
          codUsuario: 1, // Aquí puedes cambiarlo para obtener el código del usuario autenticado usando JWT
          codCliente: input.ddlClientes,
          codLocalidad: input.ddlLocalidad,
          // codCaja: caja.codCaja,
          fechRegistro: input.txtFecha,
          horainicio: input.txtHoraInicial,
          horafinal: input.txtHoraFinal,
          duracion: input.txtTiempo,
          estado: 'SIN CONFIRMAR',
          costoTarifa: input.costoTarifa,
          comentario: input.txtComentario
        };

        const [results] = await connection.query('INSERT INTO registro SET ?', registro); // Ejecuta la inserción utilizando la conexión

        res.json({ ok: true });
      }
    } else {
      res.json({ ok: false });
    }

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

/*
const validarFecha = (id, codLocalidad, fecha, horaInicial, horaFinal) => {
  const mytime = moment().tz('America/Lima');
  const fecha_actual = mytime.format('YYYY-MM-DD');
  const hora_actual = mytime.format('HH:mm:ss');

  const query = `
    SELECT *
    FROM registro
    WHERE fechRegistro = ? AND codRegistro != ? AND codLocalidad = ?
      AND (horainicio BETWEEN ? AND ? OR horafinal BETWEEN ? AND ?)
    LIMIT 1
  `;

  return new Promise((resolve, reject) => {
    db.query(
      query,
      [fecha, id, codLocalidad, horaInicial, horaFinal, horaInicial, horaFinal],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (new Date(`${fecha} ${horaInicial}`) < new Date(`${fecha_actual} ${hora_actual}`)) {
            resolve(true);
          } else {
            resolve(results.length === 0);
          }
        }
      }
    );
  });
};
*/

const validarFecha = async (id, codLocalidad, fecha, horaInicial, horaFinal) => {
  try {
    const connection = await dbConnection(); // Obtén la conexión a la base de datos

    const mytime = moment().tz('America/Lima');
    const fecha_actual = mytime.format('YYYY-MM-DD');
    const hora_actual = mytime.format('HH:mm:ss');

    const query = `
      SELECT *
      FROM registro
      WHERE fechRegistro = ? AND codRegistro != ? AND codLocalidad = ?
        AND (horainicio BETWEEN ? AND ? OR horafinal BETWEEN ? AND ?)
      LIMIT 1
    `;

    const [results] = await connection.query(query, [
      fecha,
      id,
      codLocalidad,
      horaInicial,
      horaFinal,
      horaInicial,
      horaFinal
    ]); // Ejecuta la consulta utilizando la conexión

    if (new Date(`${fecha} ${horaInicial}`) < new Date(`${fecha_actual} ${hora_actual}`)) {
      return true;
    } else {
      return results.length === 0;
    }

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    throw error;
  }
};

//listar registro por usuario
/*
router.get('/listar-cliente/:id',verifyToken, (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT
      registro.codRegistro,
      registro.fechRegistro,
      registro.horainicio,
      registro.horafinal,
      registro.estado AS estadoRegistro,
      registro.comentario,
      registro.duracion,
      cliente.nombres AS nomCliente,
      registro.codCliente,
      localidad.codLocalidad,
      localidad.nomLocalidad,
      registro.codUsuario,
      registro.costoTarifa,
      cliente.primer_apellido,
      cliente.segundo_apellido,
      cliente.telefono,
      cliente.numDocumento
    FROM
      registro
      JOIN cliente ON registro.codCliente = cliente.codCliente
      JOIN localidad ON registro.codLocalidad = localidad.codLocalidad
    WHERE
    registro.codCliente = ?
    ORDER BY
      registro.fechRegistro DESC,
      registro.horainicio DESC`;

    db.query(sql, [id], (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
      } else {
        if (results.length === 0) {
          res.status(404).json({ error: 'No hay reservas' });
        } else {
          const perfilUsuario = results;
          res.json(perfilUsuario);
        }
      }
    });
});
*/
router.get('/listar-cliente/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const sql = `
      SELECT
        registro.codRegistro,
        registro.fechRegistro,
        registro.horainicio,
        registro.horafinal,
        registro.estado AS estadoRegistro,
        registro.comentario,
        registro.duracion,
        cliente.nombres AS nomCliente,
        registro.codCliente,
        localidad.codLocalidad,
        localidad.nomLocalidad,
        registro.codUsuario,
        registro.costoTarifa,
        cliente.primer_apellido,
        cliente.segundo_apellido,
        cliente.telefono,
        cliente.numDocumento
      FROM
        registro
        JOIN cliente ON registro.codCliente = cliente.codCliente
        JOIN localidad ON registro.codLocalidad = localidad.codLocalidad
      WHERE
        registro.codCliente = ?
      ORDER BY
        registro.fechRegistro DESC,
        registro.horainicio DESC`;

    const connection = await dbConnection(); // Obtén la conexión a la base de datos

    const [results] = await connection.query(sql, [id]); // Ejecuta la consulta utilizando la conexión

    if (results.length === 0) {
      res.status(404).json({ error: 'No hay reservas' });
    } else {
      const perfilUsuario = results;
      res.json(perfilUsuario);
    }

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
/*
router.post('/precio', verifyToken, (req, res) => {
  const { codCliente, codLocalidad, fechRegistro, horainicio, horafinal } = req.body;
  const clienteQuery = `SELECT * FROM cliente WHERE codCliente = ${codCliente}`;
  db.query(clienteQuery, (error, results) => {
    if (error) {
      console.error('Error al consultar la tabla "cliente": ', error);
      res.status(500).json({ error: 'Error en el servidor' });
      return;
    }

    if (results.length === 0) {
      res.status(400).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cliente = results[0];
    const tipoCliente = cliente.tipo;
    const hora = horainicio;

    let precioQuery;
    let casoValido = true;
      switch (tipoCliente) {
        case 'CLIENTE':
          // Validar si es en la mañana o en la tarde
          if (hora >= "06:00:00" && hora < "19:00:00") {
            precioQuery = `SELECT precioDia FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          } else if (hora >= "19:00:00" && hora < "22:00:00") {
            precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          } else {
            casoValido = false;
          }
          break;
        case 'MAYOR':
          precioQuery = `SELECT precioAdultosMayor FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          break;
        case 'MENOR':
          precioQuery = `SELECT precioMenores FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          break;
        case 'VECINO_SI':
          precioQuery = `SELECT precioVecinosSI FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          break;
        case 'VECINO_VSP':
          precioQuery = `SELECT precioVecinosVSP FROM localidad WHERE codLocalidad = ${codLocalidad}`;
          break;
        default:
          casoValido = false;
      }
      
      if (!casoValido) {
        res.status(400).json({ error: 'Tipo de cliente o horario no válido' });
        return;
      }

    // Realizar la consulta de precio correspondiente
    db.query(precioQuery, (err, result) => {
      if (err) {
        console.error('Error al consultar la tabla "localidad": ', err);
        res.status(500).json({ error: 'Error en el servidor' });
        return;
      }

      if (result.length === 0) {
        res.status(400).json({ error: 'Localidad no encontrada' });
        return;
      }

      const precio = result[0].precioDia || result[0].precioNoche || result[0].precioAdultosMayor || result[0].precioMenores || result[0].precioVecinosSI || result[0].precioVecinosVSP;
      res.json({ precio });
    });
  });
});
*/
/*
router.post('/precio', verifyToken, async (req, res) => {
  try {
    const { codCliente, codLocalidad, fechRegistro, horainicio, horafinal } = req.body;
    const clienteQuery = `SELECT * FROM cliente WHERE codCliente = ${codCliente}`;

    const connection = await dbConnection(); // Obtén la conexión a la base de datos

    const [clienteResults] = await connection.query(clienteQuery); // Consulta el cliente utilizando la conexión

    if (clienteResults.length === 0) {
      res.status(400).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cliente = clienteResults[0];
    const tipoCliente = cliente.tipo;
    const hora = horainicio;

    let precioQuery;
    let casoValido = true;

    switch (tipoCliente) {
      case 'CLIENTE':
        // Validar si es en la mañana o en la tarde
        if (hora >= "06:00:00" && hora < "18:00:00") {
          precioQuery = `SELECT precioDia FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else if (hora >= "18:00:00" && hora < "22:00:00") {
          precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else {
          casoValido = false;
        }
        break;
      case 'MAYOR':
        //precioQuery = `SELECT precioAdultosMayor FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        if (hora >= "06:00:00" && hora < "18:00:00") {
          precioQuery = `SELECT precioAdultosMayor FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else if (hora >= "18:00:00" && hora < "22:00:00") {
          precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else {
          casoValido = false;
        }
        break;
      case 'MENOR':
        //precioQuery = `SELECT precioMenores FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        if (hora >= "06:00:00" && hora < "18:00:00") {
          precioQuery = `SELECT precioMenores FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else if (hora >= "18:00:00" && hora < "22:00:00") {
          precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else {
          casoValido = false;
        }
        break;
      case 'VECINO_SI':
       // precioQuery = `SELECT precioVecinosSI FROM localidad WHERE codLocalidad = ${codLocalidad}`;
       if (hora >= "06:00:00" && hora < "18:00:00") {
        precioQuery = `SELECT precioVecinosSI FROM localidad WHERE codLocalidad = ${codLocalidad}`;
      } else if (hora >= "18:00:00" && hora < "22:00:00") {
        precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
      } else {
        casoValido = false;
      }
        break;
      case 'VECINO_VSP':
        //precioQuery = `SELECT precioVecinosVSP FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        if (hora >= "06:00:00" && hora < "18:00:00") {
          precioQuery = `SELECT precioVecinosVSP FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else if (hora >= "18:00:00" && hora < "22:00:00") {
          precioQuery = `SELECT precioNoche FROM localidad WHERE codLocalidad = ${codLocalidad}`;
        } else {
          casoValido = false;
        }
        break;
      default:
        casoValido = false;
    }

    if (!casoValido) {
      res.status(400).json({ error: 'Tipo de cliente o horario no válido' });
      return;
    }

    // Realizar la consulta de precio correspondiente
    const [precioResults] = await connection.query(precioQuery); // Consulta el precio utilizando la conexión

    if (precioResults.length === 0) {
      res.status(400).json({ error: 'Localidad no encontrada' });
      return;
    }

    const precio = precioResults[0].precioDia || precioResults[0].precioNoche || precioResults[0].precioAdultosMayor || precioResults[0].precioMenores || precioResults[0].precioVecinosSI || precioResults[0].precioVecinosVSP;
    res.json({ precio });

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
*/
router.post('/precio', verifyToken, async (req, res) => {
  try {
    const { codCliente, codLocalidad, fechRegistro, horainicio, horafinal } = req.body;
    const clienteQuery = 'SELECT * FROM cliente WHERE codCliente = ?';
    const precioQueries = {
      CLIENTE: {
        '06:00:00-18:00:00': 'SELECT precioDia FROM localidad WHERE codLocalidad = ?',
        '18:00:00-22:00:00': 'SELECT precioNoche FROM localidad WHERE codLocalidad = ?'
      },
      MAYOR: {
        '06:00:00-18:00:00': 'SELECT precioAdultosMayor FROM localidad WHERE codLocalidad = ?',
        '18:00:00-22:00:00': 'SELECT precioNoche FROM localidad WHERE codLocalidad = ?'
      },
      MENOR: {
        '06:00:00-18:00:00': 'SELECT precioMenores FROM localidad WHERE codLocalidad = ?',
        '18:00:00-22:00:00': 'SELECT precioNoche FROM localidad WHERE codLocalidad = ?'
      },
      VECINO_SI: {
        '06:00:00-18:00:00': 'SELECT precioVecinosSI FROM localidad WHERE codLocalidad = ?',
        '18:00:00-22:00:00': 'SELECT precioNoche FROM localidad WHERE codLocalidad = ?'
      },
      VECINO_VSP: {
        '06:00:00-18:00:00': 'SELECT precioVecinosVSP FROM localidad WHERE codLocalidad = ?',
        '18:00:00-22:00:00': 'SELECT precioNoche FROM localidad WHERE codLocalidad = ?'
      }
    };

    const connection = await dbConnection();

    const [clienteResults] = await connection.query(clienteQuery, [codCliente]);

    if (clienteResults.length === 0) {
      res.status(400).json({ error: 'Usuario no encontrado' });
      return;
    }

    const cliente = clienteResults[0];
    const tipoCliente = cliente.tipo;
    const hora = horainicio;

    const horaKey = (hora >= '06:00:00' && hora < '18:00:00') ? '06:00:00-18:00:00' : '18:00:00-22:00:00';
    const precioQuery = precioQueries[tipoCliente][horaKey];

    if (!precioQuery) {
      res.status(400).json({ error: 'Tipo de cliente o horario no válido' });
      return;
    }

    const [precioResults] = await connection.query(precioQuery, [codLocalidad]);

    if (precioResults.length === 0) {
      res.status(400).json({ error: 'Localidad no encontrada' });
      return;
    }

    const precio = precioResults[0].precioDia || precioResults[0].precioNoche || precioResults[0].precioAdultosMayor || precioResults[0].precioMenores || precioResults[0].precioVecinosSI || precioResults[0].precioVecinosVSP;
    res.json({ precio });

    connection.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


router.post('/validar-fecha-reserva', async (req, res) => {
  try {
    const connection = await dbConnection(); // Obtén la conexión a la base de datos
    const input = req.body;

    // Verificar si hay una campaña que comienza en la misma hora y localidad
    const [existingCampaigns] = await connection.query(
      'SELECT * FROM registro WHERE horainicio = ? AND codLocalidad = ? AND fechRegistro = ?',
      [input.txtHoraInicial, input.ddlLocalidad, input.txtFecha]
    );

    if (existingCampaigns.length > 0) {
      // Si hay una campaña que comienza en la misma hora y localidad, devolver una respuesta indicando que no se puede registrar la reserva
      //res.json({ ok: false, message: 'Ya hay una campaña que comienza en la misma hora y localidad.' });
      res.status(400).json({ error: 'Ya hay una campaña que comienza en la misma hora y localidad.' });
    } else {
      // Si no hay campañas que cumplan con los criterios, la reserva es válida
      res.json({ ok: true });
    }

    connection.release(); // Libera la conexión del pool cuando hayas terminado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/registro/:id', async (req, res) => {
  try {
    const registroId = req.params.id;
    const registroQuery = 'SELECT * FROM registro WHERE codRegistro = ?';

    const connection = await dbConnection();
    const [registroResults] = await connection.query(registroQuery, [registroId]);

    if (registroResults.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = registroResults[0];
    
    const resultado = {
     pedido
    };

    res.json(resultado);

    connection.release();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
