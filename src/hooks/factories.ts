interface Factory {
  factory_name: string;
  country: string;
}

export const useFactory = () => {
  const getFactories = async () => {
    try {
      const req = await fetch(
        `/api/factories`
      );
      const { docs } = await req.json();

      // Explicitly define the Factory interface
      const factoriesData: Factory[] = docs.map(
        ({
          factory_name,
          country,
        }: {
          factory_name: string;
          country: string;
        }) => ({
          factory_name,
          country,
        })
      );
      console.log(factoriesData);

      return factoriesData;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  return { getFactories };
};
