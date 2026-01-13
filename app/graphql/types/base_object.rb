module Types
  class BaseObject < GraphQL::Schema::Object
    def self.association_field(name, type:, null:, id_field: true, id_type: ID, id_null: null)
      field :"#{name}_id", id_type, null: id_null if id_field
      field name, type, null: null

      define_method(name) do
        dataloader.with(Loaders::AssociationLoader, object.class, name).load(object)
      end
    end
  end
end
