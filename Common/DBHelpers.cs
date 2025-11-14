using Oracle.ManagedDataAccess.Client;
using System;
using System.Configuration;
using System.Data;

namespace TrainingRecord.Common
{
    public class DBHelpers
    {
        private OracleConnection connection;

        public DBHelpers()
        {
            connection = new OracleConnection(ConfigurationManager.ConnectionStrings["OracleConnectionString"].ConnectionString);
        }

        public void OpenConnection()
        {
            try
            {
                if (connection.State != ConnectionState.Open)
                {
                    connection.Open();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error OpenConnection: " + ex.Message, ex);
            }
        }

        public void CloseConnection()
        {
            if (connection.State != ConnectionState.Closed)
            {
                connection.Close();
            }
        }

        // NEW unified, simple signature
        public DataTable ExecuteQuery(string query, params OracleParameter[] parameters)
        {
            var dt = new DataTable();
            try
            {
                OpenConnection();
                using (var command = new OracleCommand(query, connection))
                {
                    if (parameters != null && parameters.Length > 0)
                        command.Parameters.AddRange(parameters);

                    using (var adapter = new OracleDataAdapter(command))
                    {
                        adapter.Fill(dt);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error ExecuteQuery: " + ex.Message, ex);
            }
            finally
            {
                CloseConnection();
            }
            return dt;
        }

        public int ExecuteNonQuery(string query, params OracleParameter[] parameters)
        {
            try
            {
                OpenConnection();
                using (var command = new OracleCommand(query, connection))
                {
                    if (parameters != null && parameters.Length > 0)
                        command.Parameters.AddRange(parameters);

                    return command.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error ExecuteNonQuery: " + ex.Message, ex);
            }
            finally
            {
                CloseConnection();
            }
        }
    }
}