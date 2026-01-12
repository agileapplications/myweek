if Rails.env.development?
  GraphiQL::Rails.config.headers["Authorization"] = ->(_context) { "" }
end
