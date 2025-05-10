class HandlePagination {
  getSkipValue(page = 1, limit = 10) {
    return (Number(page) - 1) * Number(limit);
  }

  createPaginationData(total, page = 1, limit = 10) {
    const numPage = Number(page);
    const numLimit = Number(limit);

    return {
      total,
      page: numPage,
      limit: numLimit,
      pages: Math.ceil(total / numLimit),
    };
  }
}

/**
 * Tạo lỗi với status code và message
 */
const throwError = (status, message) => {
  throw { status, message };
};

module.exports = {
  handlePagination: new HandlePagination(),
  throwError,
};
