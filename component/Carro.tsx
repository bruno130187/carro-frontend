import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/FontAwesome";

export interface Carro {
  id: number;
  nome: string;
  marca: string;
  modelo: string;
}

const API_URL = "http://10.0.2.2:8080/carro";

const CarroComponent = () => {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [nome, setNome] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [search, setSearch] = useState("");
  const [editingCarro, setEditingCarro] = useState<Carro | null>(null);

  // Função para carregar os carros
  const fetchCarros = async () => {
    try {
      const response = await axios.get<Carro[]>(API_URL);
      setCarros(response.data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os carros.");
      console.error(error);
    }
  };

  // Carregar os carros ao montar o componente
  useEffect(() => {
    fetchCarros();
  }, []);

  const handleAddOrEditCarro = async () => {
    if (!nome || !marca || !modelo) {
      Alert.alert("Erro", "Todos os campos são obrigatórios.");
      return;
    }

    try {
      if (editingCarro) {
        // Editar carro existente
        console.log("Editingcarro: ", editingCarro);
        const response = await axios.put(`${API_URL}/${editingCarro.id}`, {
          nome,
          marca,
          modelo,
        });
        if (response.data.messages?.includes("CARRO_ATUALIZADO_COM_SUCESSO")) {
          setCarros((prevCarros) =>
            prevCarros.map((carro) =>
              carro.id === editingCarro.id
                ? { ...carro, nome, marca, modelo }
                : carro
            )
          );
        }
        setEditingCarro(null);
      } else {
        // Adicionar novo carro
        const response = await axios.post(API_URL, { nome, marca, modelo });
        setCarros((prevCarros) => [...prevCarros, response.data]);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o carro.");
      console.error(error);
    }

    setNome("");
    setMarca("");
    setModelo("");
  };

  const handleDeleteCarro = async (id: number) => {
    Alert.alert("Confirmação", "Deseja excluir este carro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/${id}`);
            setCarros((prevCarros) =>
              prevCarros.filter((carro) => carro.id !== id)
            );
          } catch (error) {
            Alert.alert("Erro", "Não foi possível excluir o carro.");
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleEditCarro = (carro: Carro) => {
    setNome(carro.nome);
    setMarca(carro.marca);
    setModelo(carro.modelo);
    setEditingCarro(carro);
  };

  const handleLimpaFormulario = () => {
    setNome("");
    setMarca("");
    setModelo("");
    setEditingCarro(null);
  };

  const filteredCarros = carros.filter((carro) =>
    carro?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciamento de Carros</Text>

      {/* Formulário */}
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Marca"
        value={marca}
        onChangeText={setMarca}
        style={styles.input}
      />
      <TextInput
        placeholder="Modelo"
        value={modelo}
        onChangeText={setModelo}
        style={styles.input}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.iconButtonSalvar}
          onPress={handleAddOrEditCarro}
        >
          <Icon name="save" size={25} color="#ffffff" />
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButtonLimpar}
          onPress={handleLimpaFormulario}
        >
          <Icon name="eraser" size={25} color="#FFFFFF" />
          <Text style={styles.buttonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <TextInput
        placeholder="Pesquisar..."
        value={search}
        onChangeText={setSearch}
        style={styles.inputSearch}
      />

      {/* Lista de carros */}
      <FlatList
        data={filteredCarros || []}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <View style={styles.carroItem}>
            <Text style={styles.carroText}>
              <Text style={styles.label}>-</Text>{" "}
              {item?.nome ? truncateText(item.nome, 30) : "Nome indisponível"}
            </Text>
            <Text style={styles.carroText}>
              <Text style={styles.label}>-</Text>{" "}
              {item?.marca
                ? truncateText(item.marca, 30)
                : "Marca indisponível"}
            </Text>
            <Text style={styles.carroText}>
              <Text style={styles.label}>-</Text>{" "}
              {item?.modelo
                ? truncateText(item.modelo, 30)
                : "Modelo indisponível"}
            </Text>
            <View style={styles.buttonContainer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.iconButtonEditar}
                  onPress={() => handleEditCarro(item)}
                >
                  <Icon name="edit" size={25} color="#ffffff" />
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonDeletar}
                  onPress={() => handleDeleteCarro(item?.id)}
                >
                  <Icon name="trash" size={25} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Deletar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    width: "98%",
    backgroundColor: "#d7f3bb",
  },
  label: {
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "column",
    gap: 10,
  },
  button: {
    marginBottom: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 11,
    paddingTop: 5
  },
  title: {
    color: "#537037",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  inputSearch: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 10,
  },
  carroItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    backgroundColor: "#b2e084",
    borderRadius: 5,
  },
  carroText: {
    fontSize: 18,
    marginBottom: 5,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    color: "blue",
    marginRight: 10,
  },
  deleteButton: {
    color: "red",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 0,
  },
  iconButtonLimpar: {
    backgroundColor: "#d3cc12", // Cor do botão
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDeletar: {
    backgroundColor: "#e10f0f", // Cor do botão
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonSalvar: {
    backgroundColor: "#2c66d3", // Cor do botão
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonEditar: {
    backgroundColor: "#12821e", // Cor do botão
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CarroComponent;
