import { Request, Response } from 'express';
import { createInvoice, getInvoiceByRequestId } from '../../services/invoice/invoice.service';

export async function getInvoiceByRequestIdController(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const data = await getInvoiceByRequestId(requestId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get invoice';
    const statusCode = message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({ success: false, message });
  }
}

export async function createInvoiceController(req: Request, res: Response) {
  try {
    const data = await createInvoice(req.body);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice';

    let statusCode = 500;
    if (message.includes('required') || message.includes('valid number')) statusCode = 400;
    if (message.includes('not found')) statusCode = 404;
    if (message.includes('already exists')) statusCode = 409;

    res.status(statusCode).json({ success: false, message });
  }
}
