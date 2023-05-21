const express = require('express');
const router = express.Router();
const db = require('../core/db_config'); // Importa el módulo para acceder a la base de datos
const moment = require('moment');


router.get('/listar/', (req, res) => {
  const id = req.body.id;
console.log({id})
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
      registro.codUsuario
    FROM
      registro
      JOIN cliente ON registro.codCliente = cliente.codCliente
      JOIN localidad ON registro.codLocalidad = localidad.codLocalidad
    WHERE
      registro.codLocalidad = ?`;

  db.query(sql, [id], (error, rows) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      const nueva_agenda = rows.map((value) => ({
        id: value.codRegistro,
        start: `${value.fechRegistro} ${value.horainicio}`,
        end: `${value.fechRegistro} ${value.horafinal}`,
        title: `${value.estadoRegistro} - ${value.nomCliente}`,
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
    }
  });
});

// Ruta para guardar el registro
router.post('/guardar', (req, res) => {
  const input = req.body;
  console.log({input})
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
          //pago: 0,
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

module.exports = router;
