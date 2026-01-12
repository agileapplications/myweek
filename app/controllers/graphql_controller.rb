class GraphqlController < ApplicationController
  protect_from_forgery with: :null_session

  def execute
    result = MyweekSchema.execute(
      params[:query],
      variables: prepare_variables(params[:variables]),
      context: {},
      operation_name: params[:operationName]
    )

    render json: result
  end

  private

  def prepare_variables(variables_param)
    case variables_param
    when String
      variables_param.present? ? JSON.parse(variables_param) : {}
    when Hash
      variables_param
    when ActionController::Parameters
      variables_param.to_unsafe_h
    when nil
      {}
    else
      raise ArgumentError, "Unexpected variables: #{variables_param}"
    end
  end
end
